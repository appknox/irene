import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';

import splunkValidation from './validator';
import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
import type { AjaxError } from 'irene/services/ajax';

type SplunkIntegrationFields = {
  instance_url: string;
  hec_token: string;
  api_token: string;
  vulnerability_index: string;
  send_user_logs: boolean;
  user_logs_index: string;
  log_frequency_hours: number;
};

type logHoursItem = {
  label: string;
  value: number;
};

type indexItem = {
  label: string;
  value: string;
};

type ChangesetBufferProps = BufferedChangeset &
  SplunkIntegrationFields & {
    error: { [key in keyof SplunkIntegrationFields]: boolean };
  };

interface SplunkCheckResponse {
  id: number;
  instance_url: string;
  hec_token: string;
  api_token: string;
  vulnerability_index: string;
  send_user_logs: boolean;
  user_logs_index: string;
  log_frequency_hours: number;
  created_on: Date;
  updated_on: Date;
}

export interface OrganizationIntegrationsSplunkSignature {
  Args: {
    user: UserModel;
  };
}

export default class OrganizationIntegrationsSplunkComponent extends Component<OrganizationIntegrationsSplunkSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  tPleaseTryAgain: string;
  tSplunkIntegrated: string;
  tSplunkWillBeRevoked: string;
  changeset: ChangesetBufferProps;

  @tracked splunkInstanceURL = '';
  @tracked splunkPOJO: Record<string, unknown> = {};

  @tracked isStep2 = false;
  @tracked sendUserLogs = false;

  @tracked hecToken = '';
  @tracked apiToken = '';
  @tracked selectedVulnIndex: indexItem | undefined = undefined;
  @tracked selectedUserLogIndex: indexItem | undefined = undefined;
  @tracked selectedLogHour!: logHoursItem;
  @tracked indexOptions: { label: string; value: string }[] = [];

  @tracked isSplunkIntegrated = false;
  @tracked showRevokeSplunkConfirmBox = false;
  @tracked integrationDrawerIsOpen = false;
  @tracked isEditing = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsSplunkSignature['Args']
  ) {
    super(owner, args);

    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
    this.tSplunkIntegrated = this.intl.t('splunkIntegrated');
    this.tSplunkWillBeRevoked = this.intl.t('splunk.willBeRevoked');

    const splunkPOJO = this.splunkPOJO;

    this.changeset = Changeset(
      splunkPOJO,
      lookupValidator(splunkValidation),
      splunkValidation
    ) as ChangesetBufferProps;

    this.checkSplunkIntegration.perform();
  }

  get data() {
    return {
      id: 'Splunk',
      title: this.intl.t('splunk.title'),
      description: this.intl.t('splunkIntegrationDesc'),
      logo: '../../../images/splunk-icon.png',
      isIntegrated: this.isSplunkIntegrated,
    };
  }

  get logHourOptions() {
    return [
      {
        label: `24 ${this.intl.t('hours')}`,
        value: 24,
      },
      { label: `48 ${this.intl.t('hours')}`, value: 48 },
      { label: `72 ${this.intl.t('hours')}`, value: 72 },
    ];
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateSplunk'],
    ].join('/');
  }

  get isLoadingSplunkData() {
    return this.checkSplunkIntegration.isRunning;
  }

  get isLoadingIndexes() {
    return this.getIndexes.isRunning;
  }

  get showIntegratedOrLoadingUI() {
    return this.isSplunkIntegrated || this.isLoadingSplunkData;
  }

  get noFooter() {
    return (
      (!this.isStep2 && !this.showIntegratedOrLoadingUI) ||
      this.showRevokeSplunkConfirmBox
    );
  }

  get drawerTitle() {
    return this.showRevokeSplunkConfirmBox
      ? this.intl.t('confirmation')
      : this.intl.t('splunkIntegration');
  }

  get loadingDrawerSaveAction() {
    return this.revokeSplunk.isRunning || this.integrateSplunk.isRunning;
  }

  get drawerSaveAction() {
    return this.showIntegratedOrLoadingUI
      ? this.openRevokeSplunkConfirmBox
      : this.completeIntegration;
  }

  @action
  populateChangeset() {
    this.changeset.set('vulnerability_index', this.selectedVulnIndex?.value);
    this.changeset.set('send_user_logs', this.sendUserLogs);
    this.changeset.set('user_logs_index', this.selectedUserLogIndex?.value);
    this.changeset.set('log_frequency_hours', this.selectedLogHour?.value);
    this.changeset.set('instance_url', this.splunkInstanceURL);
    this.changeset.set('hec_token', this.hecToken);
    this.changeset.set('api_token', this.apiToken);
  }

  @action
  async editDetails() {
    this.isEditing = true;
    await this.checkSplunkIntegration.perform();
    await this.getIndexes.perform();

    this.populateChangeset();

    await this.integrateSplunk.perform(this.changeset);
  }

  @action
  async saveUserLogDetails() {
    this.isEditing = false;
    await this.integrateSplunk.perform(this.changeset);
  }

  @action
  async toggleSendUserLogs(_: Event, checked?: boolean) {
    this.changeset.send_user_logs = !!checked;
    this.sendUserLogs = !!checked;
  }

  @action
  async toggleSendUserLogsAPI(_: Event, checked?: boolean) {
    this.changeset.send_user_logs = !!checked;
    this.sendUserLogs = !!checked;

    if (
      !this.changeset.instance_url ||
      !this.changeset.hec_token ||
      !this.changeset.api_token
    ) {
      this.populateChangeset();
    }

    await this.integrateSplunk.perform(this.changeset);
  }

  @action
  setVulnIndex(param: indexItem) {
    this.selectedVulnIndex = param;
    this.changeset.vulnerability_index = param.value;
  }

  @action
  setUserLogIndex(param: indexItem) {
    this.selectedUserLogIndex = param;
    this.changeset.user_logs_index = param.value;
  }

  @action
  setLogHour(option: logHoursItem) {
    this.selectedLogHour = option;
    this.changeset.log_frequency_hours = option.value;
  }

  @action
  openDrawer() {
    this.integrationDrawerIsOpen = true;
  }

  @action
  closeDrawer() {
    this.integrationDrawerIsOpen = false;
    this.isEditing = false;

    if (!this.isSplunkIntegrated) {
      this.resetSplunkInputs();
    }
  }

  @action
  resetSplunkInputs() {
    this.splunkInstanceURL = '';
    this.hecToken = '';
    this.apiToken = '';
    this.sendUserLogs = false;
    this.selectedVulnIndex = undefined;
    this.selectedUserLogIndex = undefined;
    this.selectedLogHour = { label: `24 ${this.intl.t('hours')}`, value: 24 };
    this.isEditing = false;
    this.isStep2 = false;
    this.changeset.rollback();
  }

  @action
  async completeIntegration() {
    await this.integrateSplunk.perform(this.changeset);

    triggerAnalytics(
      'feature',
      ENV.csb['integrateSplunk'] as CsbAnalyticsFeatureData
    );

    this.isSplunkIntegrated = true;
    this.checkSplunkIntegration.perform();
    this.integrationDrawerIsOpen = false;

    this.notify.success(this.tSplunkIntegrated);
  }

  @action
  goBack() {
    this.isEditing = false;
    this.isStep2 = false;
  }

  @action
  openRevokeSplunkConfirmBox() {
    this.showRevokeSplunkConfirmBox = true;
    this.isStep2 = false;
  }

  @action
  closeRevokeSplunkConfirmBox() {
    this.showRevokeSplunkConfirmBox = false;
  }

  checkSplunkIntegration = task(async () => {
    try {
      const data = await this.ajax.request<SplunkCheckResponse>(this.baseURL);

      if (!data.vulnerability_index) {
        this.isSplunkIntegrated = false;
        this.resetSplunkInputs();

        return;
      }

      this.splunkInstanceURL = data.instance_url;
      this.hecToken = data.hec_token;
      this.apiToken = data.api_token;
      this.sendUserLogs = data.send_user_logs;

      this.isSplunkIntegrated = !!(
        data.instance_url && data.vulnerability_index
      );

      this.selectedUserLogIndex = {
        label: data.user_logs_index,
        value: data.user_logs_index,
      };

      this.selectedLogHour = {
        label: `${data.log_frequency_hours} ${this.intl.t('hours')}`,
        value: data.log_frequency_hours,
      };

      this.selectedVulnIndex = {
        label: data.vulnerability_index,
        value: data.vulnerability_index,
      };

      this.populateChangeset();
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.isSplunkIntegrated = false;
      }

      this.resetSplunkInputs();
    }
  });

  goToStep2 = task(async () => {
    const { instance_url, hec_token, api_token } = this.changeset;

    const isStep1Filled =
      instance_url?.trim() && hec_token?.trim() && api_token?.trim();

    if (!isStep1Filled) {
      this.notify.error(this.intl.t('splunk.fillRequiredFields'));

      return;
    }

    await this.changeset.validate();

    const isValid = this.changeset.isValid;

    if (!isValid) {
      if (this.changeset.errors && this.changeset.errors[0]?.validation) {
        const validation = this.changeset.errors[0].validation;
        const errorMessage = Array.isArray(validation)
          ? validation.join(', ')
          : validation;

        this.notify.error(errorMessage, ENV.notifications);
      }

      return;
    }

    try {
      await this.integrateSplunk.perform(this.changeset);
      const indexes = await this.getIndexes.perform();

      if (indexes && indexes.length > 0) {
        this.isStep2 = true;
      }
    } catch (error) {
      this.isStep2 = false;
    }
  });

  getIndexes = task(async () => {
    try {
      const data = await this.ajax.request<{ indexes: string[] }>(
        `${this.baseURL}/indexes`
      );

      const indexes = data.indexes
        .filter((index) => !index.startsWith('_'))
        .reverse()
        .map((index) => ({ label: index, value: index })) as indexItem[];

      this.indexOptions = indexes;

      if (indexes.length > 0) {
        const currVulnIndex = this.selectedVulnIndex?.value;
        const currUserLogIndex = this.selectedUserLogIndex?.value;

        // If the current vuln index is not in the indexes array, set the first index as the selected vuln index
        const selectedVulnIndex =
          indexes.find((idx) => idx.value === currVulnIndex) ||
          this.indexOptions[0];

        this.setVulnIndex(selectedVulnIndex as indexItem);

        // If the current user log index is not in the indexes array, set the second index as the selected user log index
        const selectedUserLogIndex =
          indexes.find((idx) => idx.value === currUserLogIndex) ||
          this.indexOptions[1] ||
          this.indexOptions[0];

        this.setUserLogIndex(selectedUserLogIndex as indexItem);
      }

      return indexes;
    } catch (err: any) {
      const errorDetail = err?.detail;
      this.isStep2 = false;

      this.notify.error(
        parseError(errorDetail, this.intl.t('splunk.errorFetchingIndexes'))
      );

      return [];
    }
  });

  revokeSplunk = task(async () => {
    try {
      await this.ajax.delete(this.baseURL);

      this.isSplunkIntegrated = false;

      this.closeRevokeSplunkConfirmBox();
      this.checkSplunkIntegration.perform();
      this.resetSplunkInputs();

      this.notify.success(this.tSplunkWillBeRevoked);
    } catch (error) {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  integrateSplunk = task(async (changeset) => {
    await changeset.validate();

    if (!changeset.isValid) {
      if (changeset.errors && changeset.errors[0].validation) {
        this.notify.error(changeset.errors[0].validation, ENV.notifications);
      }

      return;
    }

    const cleanInstanceUrl = changeset.instance_url?.trim().replace(/\/$/, '');

    const data = {
      instance_url: cleanInstanceUrl,
      hec_token: changeset.hec_token.trim(),
      api_token: changeset.api_token.trim(),
      vulnerability_index: changeset.vulnerability_index,
      send_user_logs: changeset.send_user_logs,
      user_logs_index: changeset.user_logs_index,
      log_frequency_hours: changeset.log_frequency_hours,
    };

    try {
      await this.ajax.post(this.baseURL, { data });
    } catch (err) {
      const error = err as AdapterError;
      const errorKeys = Object.keys(error.payload);
      const hasError = errorKeys.length > 0;

      // Notify first error message
      if (hasError) {
        const field = String(errorKeys?.[0]);
        const message = error.payload[field][0];

        this.notify.error(`${field} - ${message}`, ENV.notifications);
      } else {
        this.notify.error(parseError(err, this.tPleaseTryAgain));
      }

      throw err;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::Splunk': typeof OrganizationIntegrationsSplunkComponent;
  }
}
