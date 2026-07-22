import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import serviceNowValidation from '../service-now/validator';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
import type AnalyticsService from 'irene/services/analytics';
import type { AjaxError } from 'irene/services/ajax';
import type { AppknoxSourceKey, SNColumn } from '../service-now/index';

type SNFields = { username: string; password: string; instanceURL: string };

export type ChangesetBufferProps = BufferedChangeset &
  SNFields & {
    error: { [key in keyof SNFields]: boolean };
  };

export type SNTableItem = { label: string; value: number };
export type SNCustomTable = { label: string; value: string };

interface SNCheckResponse {
  instance_url: string;
  username: string;
  /** False when only Step 1 credentials were saved; true after Step 2 is done. */
  is_complete: boolean;
  table_name: string;
  auto_push: boolean;
  custom_table_name: string;
}

interface TableListResponse {
  tables: Array<{ name: string; label: string }>;
}

interface ColumnListResponse {
  columns: Array<{ element: string; column_label: string; type: string }>;
}

const SAFE_KEY_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SEARCH_DEBOUNCE_MS = 300;
const INTEGRATIONS_ROUTE =
  'authenticated.dashboard.organization-settings.integrations';

export interface OrganizationIntegrationsServiceNowDetailSignature {
  Args: { user: UserModel };
}

export default class OrganizationIntegrationsServiceNowDetailComponent extends Component<OrganizationIntegrationsServiceNowDetailSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare analytics: AnalyticsService;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  tPleaseTryAgain: string;
  tIntegrated: string;
  tRevoked: string;
  changeset: ChangesetBufferProps;

  @tracked isStep2 = false;
  @tracked isServiceNowIntegrated = false;
  @tracked showRevokeConfirmBox = false;
  @tracked snInstanceURL = '';
  @tracked snUsername = '';
  @tracked snTableName = '';
  @tracked snCustomTableName = '';
  @tracked snAutoPush = false;
  @tracked selectedSNTable: SNTableItem | null = null;
  @tracked autoPush = false;
  @tracked customTableSearch = '';
  @tracked customTableSuggestions: SNCustomTable[] = [];
  @tracked selectedCustomTable: SNCustomTable | null = null;
  @tracked tableColumns: SNColumn[] = [];
  @tracked fieldMapping: Record<string, SNColumn | undefined> = {};

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsServiceNowDetailSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tIntegrated = this.intl.t('serviceNowIntegrated');
    this.tRevoked = this.intl.t('serviceNow.willBeRevoked');

    this.changeset = Changeset(
      {},
      lookupValidator(serviceNowValidation),
      serviceNowValidation
    ) as ChangesetBufferProps;

    this.checkIntegration.perform();
  }

  get snTableItems(): SNTableItem[] {
    return [
      {
        label: 'sn_vul_app_vulnerable_item',
        value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_APP_VULNERABLE_ITEM,
      },
      {
        label: 'sn_vul_vulnerable_item',
        value: ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_VULNERABLE_ITEM,
      },
      {
        label: this.intl.t('serviceNow.customTable'),
        value: ENUMS.SERVICE_NOW_TABLE_SELECTION.TABLE_CUSTOM,
      },
    ];
  }

  get appknoxSourceKeyOptions(): AppknoxSourceKey[] {
    const keys = [
      'vulnerability_name',
      'vulnerability_description',
      'vulnerability_intro',
      'risk',
      'risk_rating',
      'risk_label',
      'state',
      'source_avit_id',
      'cvss_base',
      'cvss_vector',
      'file_name',
    ];
    return keys.map((k) => ({ label: k, value: k }));
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateServiceNow'],
    ].join('/');
  }

  get isCustomTable() {
    return (
      this.selectedSNTable?.value ===
      ENUMS.SERVICE_NOW_TABLE_SELECTION.TABLE_CUSTOM
    );
  }

  get tableSelected() {
    if (!this.selectedSNTable) {
      return false;
    }

    if (this.isCustomTable) {
      return !!this.selectedCustomTable;
    }

    return true;
  }

  get availableColumnsFor(): Record<string, SNColumn[]> {
    /**
     * Returns appknox-key → SN columns still available to pick.
     * A chosen column is excluded from every other key's list but kept in its
     * own so the current selection stays valid.
     */
    const usedValues = new Set(
      Object.values(this.fieldMapping)
        .filter(Boolean)
        .map((c) => c!.value)
    );
    return Object.fromEntries(
      this.appknoxSourceKeyOptions.map((key) => {
        const ownValue = this.fieldMapping[key.value]?.value;
        return [
          key.value,
          this.tableColumns.filter(
            (c) => !usedValues.has(c.value) || c.value === ownValue
          ),
        ];
      })
    );
  }

  get isLoadingData() {
    return this.checkIntegration.isRunning;
  }

  /** Human-readable table name for the integrated summary view. */
  get resolvedTableName(): string {
    const num = Number(this.snTableName);
    if (num === ENUMS.SERVICE_NOW_TABLE_SELECTION.TABLE_CUSTOM) {
      return this.snCustomTableName || this.intl.t('serviceNow.customTable');
    }
    return (
      this.snTableItems.find((t) => t.value === num)?.label ?? this.snTableName
    );
  }

  get canIntegrate() {
    if (!this.tableSelected) {
      return false;
    }

    if (
      this.fetchTableColumns.isRunning ||
      this.completeIntegration.isRunning
    ) {
      return false;
    }

    if (this.isCustomTable) {
      return Object.values(this.fieldMapping).some(Boolean);
    }

    return true;
  }

  /** Navigate back: Step 2 → Step 1, Step 1 → integrations list. */
  @action handleBack() {
    if (this.isStep2) {
      this.goBack();
    } else {
      this.router.transitionTo(INTEGRATIONS_ROUTE);
    }
  }

  @action goBack() {
    this.isStep2 = false;
    this.selectedSNTable = null;
    this.customTableSearch = '';
    this.customTableSuggestions = [];
    this.selectedCustomTable = null;
    this.tableColumns = [];
    this.fieldMapping = {};
  }

  @action openRevokeConfirmBox() {
    this.showRevokeConfirmBox = true;
  }

  @action closeRevokeConfirmBox() {
    this.showRevokeConfirmBox = false;
  }

  @action setSNTable(selection: SNTableItem) {
    this.selectedSNTable = selection;
    this.selectedCustomTable = null;
    this.tableColumns = [];
    this.fieldMapping = {};
  }

  @action selectCustomTable(table: SNCustomTable) {
    this.selectedCustomTable = table;
    this.customTableSuggestions = [];
    this.tableColumns = [];
    this.fieldMapping = {};
    this.fetchTableColumns.perform(table.value);
  }

  @action handleCustomTableSearch(q: string) {
    this.customTableSearch = q;
    this.searchCustomTables.perform(q);
  }

  @action handleCustomTableSelect(item: SNCustomTable | string) {
    if (typeof item !== 'string') {
      this.selectCustomTable(item);
    }
  }

  @action clearCustomTable() {
    this.customTableSearch = '';
    this.customTableSuggestions = [];
    this.selectedCustomTable = null;
    this.tableColumns = [];
    this.fieldMapping = {};
  }

  filterAlwaysTrue = (): boolean => {
    return true;
  };

  getCustomTableLabel = (item: SNCustomTable | string) =>
    typeof item === 'string' ? item : item.label;

  @action toggleAutoPush(_: Event, checked?: boolean) {
    this.autoPush = checked ?? !this.autoPush;
  }

  @action updateMapping(appknoxKey: string, column: SNColumn | null) {
    /** Update the SN column mapped to a given Appknox field key. */
    if (!SAFE_KEY_PATTERN.test(appknoxKey)) {
      return;
    }

    const next: Record<string, SNColumn | undefined> = {};

    for (const k of Object.keys(this.fieldMapping)) {
      if (SAFE_KEY_PATTERN.test(k)) {
        next[k] = this.fieldMapping[k];
      }
    }
    next[appknoxKey] = column ?? undefined;
    this.fieldMapping = next;
  }

  checkIntegration = task(async () => {
    /**
     * Check the saved ServiceNow token for this organisation.
     * - is_complete=true  → show the integrated state.
     * - is_complete=false → Step 1 was saved but Step 2 was not; pre-fill
     *   credentials so the user only needs to re-enter their password.
     */
    try {
      const data = await this.ajax.request<SNCheckResponse>(this.baseURL);

      if (data.instance_url && data.username && data.is_complete) {
        this.isServiceNowIntegrated = true;
        this.snInstanceURL = data.instance_url;
        this.snUsername = data.username;
        this.snTableName = data.table_name ?? '';
        this.snCustomTableName = data.custom_table_name ?? '';
        this.snAutoPush = data.auto_push ?? false;
      } else if (data.instance_url && data.username) {
        // Partial save: pre-fill Step 1 so the user only re-enters password.
        this.changeset.instanceURL = data.instance_url;
        this.changeset.username = data.username;
      }
    } catch (err) {
      const error = err as AjaxError;
      if (error.status !== 404) {
        this.notify.error(this.tPleaseTryAgain);
      }
      this.isServiceNowIntegrated = false;
    }
  });

  goToStep2 = task(async (changeset: ChangesetBufferProps) => {
    /** Validate Step 1 credentials, save a partial token, then advance to Step 2. */
    await changeset.validate();

    if (!changeset.isValid) {
      const validation = changeset.errors?.[0]?.validation;
      if (validation) {
        const msg = Array.isArray(validation) ? validation[0] : validation;
        this.notify.error(String(msg), ENV.notifications);
      }
      return;
    }

    try {
      await this.ajax.post(this.baseURL, {
        data: {
          instance_url: changeset.instanceURL.trim(),
          username: changeset.username.trim(),
          password: changeset.password,
          auto_push: this.autoPush,
          table_name: String(
            ENUMS.SERVICE_NOW_TABLE_SELECTION.SN_VUL_APP_VULNERABLE_ITEM
          ),
          is_complete: false,
        },
      });
      this.isStep2 = true;
    } catch (err) {
      this._handlePostError(err);
    }
  });

  searchCustomTables = task(async (q: string) => {
    /** Debounced search for custom SN tables matching q against label. */
    await timeout(SEARCH_DEBOUNCE_MS);

    if (q !== this.customTableSearch || !q.trim()) {
      this.customTableSuggestions = [];
      return;
    }

    try {
      const data = await this.ajax.request<TableListResponse>(
        `${this.baseURL}/tables?q=${encodeURIComponent(q.trim())}`
      );
      this.customTableSuggestions = (data.tables ?? []).map((t) => ({
        label: t.label || t.name,
        value: t.name,
      }));
    } catch {
      this.customTableSuggestions = [];
    }
  });

  fetchTableColumns = task(async (tableName: string) => {
    /** Fetch columns for the given table and populate tableColumns. */
    if (!tableName) {
      return;
    }

    try {
      const data = await this.ajax.request<ColumnListResponse>(
        `${this.baseURL}/columns?table=${encodeURIComponent(tableName)}`
      );
      this.tableColumns = (data.columns ?? []).map((c) => ({
        label: `${c.column_label} (${c.element})`,
        value: c.element,
        type: c.type ?? 'string',
      }));
    } catch {
      this.tableColumns = [];
    }
  });

  completeIntegration = task(async () => {
    /** Save the full Step 2 config and mark the integration complete. */
    const payload = {
      instance_url: (this.changeset.instanceURL ?? '').trim(),
      username: (this.changeset.username ?? '').trim(),
      password: this.changeset.password ?? '',
      table_name: this.selectedSNTable?.value,
      auto_push: this.autoPush,
      custom_table_name: this.isCustomTable
        ? (this.selectedCustomTable?.value ?? '')
        : '',
      custom_field_mapping: this._buildCustomFieldMapping(),
      is_complete: true,
    };

    try {
      await this.ajax.post(this.baseURL, { data: payload });

      this.isServiceNowIntegrated = true;
      this.isStep2 = false;
      this.snInstanceURL = (this.changeset.instanceURL ?? '').trim();
      this.snUsername = (this.changeset.username ?? '').trim();
      this.snTableName = String(this.selectedSNTable?.value ?? '');
      this.snCustomTableName = this.isCustomTable
        ? (this.selectedCustomTable?.value ?? '')
        : '';
      this.snAutoPush = this.autoPush;
      this.notify.success(this.tIntegrated);

      this.analytics.track({
        name: 'INTEGRATION_INITIATED_EVENT',
        properties: { feature: 'service_now_new_integration_completed' },
      });
    } catch (err) {
      this._handlePostError(err);
    }
  });

  revokeIntegration = task(async () => {
    /** Delete the ServiceNow token and reset all integration state. */
    try {
      await this.ajax.delete(this.baseURL);

      this.isServiceNowIntegrated = false;
      this.isStep2 = false;
      this.showRevokeConfirmBox = false;
      this.changeset.rollback();

      this.notify.success(this.tRevoked);
    } catch {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  private _handlePostError(err: unknown) {
    const error = err as AdapterError;
    const payload = error?.payload ?? {};
    const firstKey = Object.keys(payload)[0];

    if (firstKey) {
      const value = payload[firstKey];
      const message = Array.isArray(value) ? String(value[0]) : String(value);
      this.notify.error(message, ENV.notifications);
    } else {
      this.notify.error(parseError(err, this.tPleaseTryAgain));
    }
  }

  private _buildCustomFieldMapping(): Record<string, string> {
    /** Build { sn_column_name: appknox_key } for the API payload. */
    const result: Record<string, string> = {};
    for (const [appknoxKey, col] of Object.entries(this.fieldMapping)) {
      if (
        col &&
        SAFE_KEY_PATTERN.test(col.value) &&
        SAFE_KEY_PATTERN.test(appknoxKey)
      ) {
        result[col.value] = appknoxKey;
      }
    }
    return result;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::ServiceNowDetail': typeof OrganizationIntegrationsServiceNowDetailComponent;
  }
}
