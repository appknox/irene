import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type ProjectModel from 'irene/models/project';
import type SplunkConfigModel from 'irene/models/splunk-config';
import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

export interface ProjectSettingsIntegrationsSplunkSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

interface SplunkCheckResponse {
  id: number;
  instance_url: string;
  hec_token: string;
  api_token: string;
  vulnerability_index: string;
}

export default class ProjectSettingsIntegrationsSplunkComponent extends Component<ProjectSettingsIntegrationsSplunkSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;

  @tracked noIntegration = false;
  @tracked noAccess = false;
  @tracked showEditSplunkRiskModal = false;
  @tracked showDeleteSplunkConfigConfirmBox = false;
  @tracked isEditing = false;

  @tracked splunkConfig: SplunkConfigModel | null = null;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsIntegrationsSplunkSignature['Args']
  ) {
    super(owner, args);
    this.fetchSplunkIntegrationProps();
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  get project() {
    return this.args.project;
  }

  get showSelectUI() {
    return !this.splunkConfig || this.isEditing;
  }

  get isFetchingSplunkConfig() {
    return this.fetchSplunkConfig.isRunning;
  }

  get data() {
    return {
      id: 'Splunk',
      title: this.intl.t('splunk.title'),
      description: this.intl.t('splunkIntegrationDesc'),
      logo: '../../../../images/splunk-icon.png',
      isIntegrated: !this.noIntegration && !this.noAccess,
      showSelectBtn: !this.splunkConfig && !this.noIntegration,
      selectBtnText: this.intl.t('selectThreshold'),
    };
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateSplunk'],
    ].join('/');
  }

  @action navigateToOrgSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.organization-settings.integrations'
    );
  }

  @action fetchSplunkIntegrationProps() {
    this.fetchSplunkConfig.perform();
    this.checkSplunkIntegration.perform();
  }

  @action openDeleteSplunkConfigConfirmBox() {
    this.showDeleteSplunkConfigConfirmBox = true;
  }

  @action closeDeleteSplunkConfigConfirmBox() {
    this.showDeleteSplunkConfigConfirmBox = false;
  }

  @action onEditClick() {
    this.isEditing = true;
  }

  @action
  confirmCallback() {
    this.deleteSplunkConfig.perform();
  }

  @action saveSelectedRiskThreshold() {
    this.selectRiskThreshold.perform();
    this.isEditing = false;
  }

  @action openSplunkRiskEditModal() {
    this.showEditSplunkRiskModal = true;
  }

  @action closeSplunkRiskEditModal() {
    this.showEditSplunkRiskModal = false;
  }

  @action selectThreshold(threshold: number) {
    this.selectedThreshold = threshold;
  }

  @action configureSplunkAdapterNamespace() {
    const adapter = this.store.adapterFor('splunk-config');
    adapter.setNestedUrlNamespace(String(this.project?.id));
  }

  fetchSplunkConfig = task(async () => {
    try {
      this.configureSplunkAdapterNamespace();

      const config = await this.store.queryRecord('splunk-config', {});

      this.splunkConfig = config;
      this.selectedThreshold = config.riskThreshold;
    } catch (err) {
      const error = err as AdapterError;
      const errorInfo = error.errors?.[0];
      const errorDetail = errorInfo?.detail;

      if (errorDetail === 'Splunk not integrated') {
        this.noIntegration = true;

        return;
      }

      if (errorDetail === 'Splunk not connected') {
        this.noAccess = true;

        return;
      }

      if (errorDetail?.includes('Not Found (404)')) {
        this.noIntegration = true;
        this.noAccess = true;

        return;
      }
    }
  });

  checkSplunkIntegration = task(async () => {
    try {
      const data = await this.ajax.request<SplunkCheckResponse>(this.baseURL);

      this.noIntegration = !(data.instance_url && data.vulnerability_index);
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.noIntegration = true;
      }
    }
  });

  deleteSplunkConfig = task(async () => {
    try {
      this.configureSplunkAdapterNamespace();

      await (this.splunkConfig as SplunkConfigModel).destroyRecord();

      this.notify.success(this.intl.t('splunk.riskThresholdRemoved'));

      this.showDeleteSplunkConfigConfirmBox = false;
      this.splunkConfig = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notify.error(parseError(err));

      this.showDeleteSplunkConfigConfirmBox = false;
    }
  });

  selectRiskThreshold = task(async () => {
    let splunkConfig = this.splunkConfig;

    const successMessage = splunkConfig
      ? this.intl.t('splunk.riskThresholdUpdated')
      : this.intl.t('integratedSplunk');

    if (splunkConfig) {
      splunkConfig.setProperties({ riskThreshold: this.selectedThreshold });
    } else {
      splunkConfig = this.store.createRecord('splunk-config', {
        riskThreshold: this.selectedThreshold,
        project: this.project,
      });
    }

    try {
      this.configureSplunkAdapterNamespace();

      await (splunkConfig as SplunkConfigModel).save();

      this.splunkConfig = splunkConfig;
      this.showEditSplunkRiskModal = false;

      this.notify.success(successMessage);
    } catch (err) {
      splunkConfig.rollbackAttributes();

      if (splunkConfig.get('dirtyType') === 'deleted') {
        splunkConfig.unloadRecord();
      }

      const error = err as AdapterError;
      const { source, detail: errorDetail } = error?.errors?.[0] || {};

      if (
        [
          '/data/attributes/riskThreshold',
          '/data/attributes/risk_threshold',
        ].includes(String(source?.pointer))
      ) {
        this.notify.error(this.intl.t('invalidRisk'));

        return;
      }

      if (errorDetail === 'Splunk not integrated') {
        this.showEditSplunkRiskModal = false;
        this.splunkConfig = null;
        this.noIntegration = true;
      }

      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::Splunk': typeof ProjectSettingsIntegrationsSplunkComponent;
  }
}
