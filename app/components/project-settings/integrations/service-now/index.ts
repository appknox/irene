import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type ProjectModel from 'irene/models/project';
import type ServiceNowConfigModel from 'irene/models/servicenow-config';

export interface ProjectSettingsIntegrationsServiceNowSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

export default class ProjectSettingsIntegrationsServiceNowComponent extends Component<ProjectSettingsIntegrationsServiceNowSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked noIntegration = false;
  @tracked noAccess = false;
  @tracked showEditSNRiskModal = false;
  @tracked showDeleteSNConfigConfirmBox = false;

  @tracked serviceNowConfig: ServiceNowConfigModel | null = null;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsIntegrationsServiceNowSignature['Args']
  ) {
    super(owner, args);
    this.fetchSNIntegrationProps();
  }

  get thresholds() {
    return ENUMS.THRESHOLD.CHOICES.filter((c) => c.key !== 'UNKNOWN').map(
      (c) => c.value
    );
  }

  get project() {
    return this.args.project;
  }

  get showHeaderActions() {
    return !!this.serviceNowConfig;
  }

  get headerSubText() {
    if (
      this.noAccess ||
      this.noIntegration ||
      this.fetchServiceNowConfig.isRunning
    ) {
      return '';
    }

    if (this.serviceNowConfig) {
      return this.intl.t('integratedServiceNow');
    }

    return this.intl.t('otherTemplates.selectServiceNowRisk');
  }

  @action fetchSNIntegrationProps() {
    this.fetchServiceNowConfig.perform();
  }

  @action openDeleteSNConfigConfirmBox() {
    this.showDeleteSNConfigConfirmBox = true;
  }

  @action
  confirmCallback() {
    this.deleteServiceNowConfig.perform();
  }

  @action saveSelectedRiskThreshold() {
    this.selectRiskThreshold.perform();
  }

  @action openSNRiskEditModal() {
    this.showEditSNRiskModal = true;
  }

  @action closeSNRiskEditModal() {
    this.showEditSNRiskModal = false;
  }

  @action selectThreshold(threshold: number) {
    this.selectedThreshold = threshold;
  }

  @action configureSNAdapterNamespace() {
    const adapter = this.store.adapterFor('servicenow-config');
    adapter.setNestedUrlNamespace(String(this.project?.id));
  }

  fetchServiceNowConfig = task(async () => {
    try {
      this.configureSNAdapterNamespace();

      const config = await this.store.queryRecord('servicenow-config', {});

      this.serviceNowConfig = config;
      this.selectedThreshold = config.riskThreshold;
    } catch (err) {
      const error = err as AdapterError;
      const { detail: errorDetail, status } = error.errors?.[0] ?? {};

      if (status === 404) {
        this.noAccess = true;

        return;
      }

      if (errorDetail === 'Servicenow not integrated') {
        this.noIntegration = true;

        return;
      }
    }
  });

  deleteServiceNowConfig = task(async () => {
    try {
      this.configureSNAdapterNamespace();

      await (this.serviceNowConfig as ServiceNowConfigModel).destroyRecord();

      this.notify.success(this.intl.t('serviceNow.riskThresholdRemoved'));

      this.showDeleteSNConfigConfirmBox = false;
      this.serviceNowConfig = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notify.error(parseError(err));

      this.showDeleteSNConfigConfirmBox = false;
    }
  });

  selectRiskThreshold = task(async () => {
    let serviceNowConfig = this.serviceNowConfig;

    const successMessage = serviceNowConfig
      ? this.intl.t('serviceNow.riskThresholdUpdated')
      : this.intl.t('integratedServiceNow');

    if (serviceNowConfig) {
      serviceNowConfig.setProperties({ riskThreshold: this.selectedThreshold });
    } else {
      serviceNowConfig = this.store.createRecord('servicenow-config', {
        riskThreshold: this.selectedThreshold,
        project: this.project,
      });
    }

    try {
      this.configureSNAdapterNamespace();

      await (serviceNowConfig as ServiceNowConfigModel).save();

      this.serviceNowConfig = serviceNowConfig;
      this.showEditSNRiskModal = false;

      this.notify.success(successMessage);
    } catch (err) {
      serviceNowConfig.rollbackAttributes();

      if (serviceNowConfig.get('dirtyType') === 'deleted') {
        serviceNowConfig.unloadRecord();
      }

      const error = err as AdapterError;
      const { source, detail: errorDetail } = error?.errors?.[0] || {};

      if (
        [
          '/data/attributes/riskThreshold',
          '/data/attributes/risk_threshold',
        ].indexOf(String(source?.pointer)) > -1
      ) {
        this.notify.error(this.intl.t('invalidRisk'));

        return;
      }

      if (errorDetail === 'ServiceNow not integrated') {
        this.showEditSNRiskModal = false;
        this.serviceNowConfig = null;
        this.noIntegration = true;
      }

      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::ServiceNow': typeof ProjectSettingsIntegrationsServiceNowComponent;
  }
}
