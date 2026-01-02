import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import ENV from 'irene/config/environment';
import type ProjectModel from 'irene/models/project';
import type SlackConfigModel from 'irene/models/slack-config';
import type OrganizationService from 'irene/services/organization';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

type SlackCheckResponse = {
  channel_id: string;
  api_token: string;
};

export interface ProjectSettingsIntegrationsSlackSignature {
  Args: {
    project?: ProjectModel | null;
  };
}

export default class ProjectSettingsIntegrationsSlackComponent extends Component<ProjectSettingsIntegrationsSlackSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare router: RouterService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;

  @tracked noIntegration = false;
  @tracked noAccess = false;
  @tracked showEditSlackRiskModal = false;
  @tracked showDeleteSlackConfigConfirmBox = false;
  @tracked isEditing = false;

  @tracked slackConfig: SlackConfigModel | null = null;
  @tracked selectedThreshold = ENUMS.THRESHOLD.LOW;

  constructor(
    owner: unknown,
    args: ProjectSettingsIntegrationsSlackSignature['Args']
  ) {
    super(owner, args);
    this.fetchSlackIntegrationProps();
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
    return !this.slackConfig || this.isEditing;
  }

  get isFetchingSlackConfig() {
    return (
      this.fetchSlackConfig.isRunning || this.checkSlackIntegration.isRunning
    );
  }

  get data() {
    return {
      id: 'Slack',
      title: this.intl.t('slack.title'),
      description: this.intl.t('slackIntegrationDesc'),
      logo: '../../../../images/slack-icon.png',
      isIntegrated: !this.noIntegration && !this.noAccess,
      showSelectBtn: !this.slackConfig && !this.noIntegration,
      selectBtnText: this.intl.t('selectThreshold'),
    };
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateSlack'],
    ].join('/');
  }

  @action navigateToOrgSettings() {
    this.router.transitionTo(
      'authenticated.dashboard.organization-settings.integrations'
    );
  }

  @action
  async fetchSlackIntegrationProps() {
    await this.checkSlackIntegration.perform();

    if (!this.noIntegration) {
      this.fetchSlackConfig.perform();
    }
  }

  @action openDeleteSlackConfigConfirmBox() {
    this.showDeleteSlackConfigConfirmBox = true;
  }

  @action closeDeleteSlackConfigConfirmBox() {
    this.showDeleteSlackConfigConfirmBox = false;
  }

  @action onEditClick() {
    this.isEditing = true;
  }

  @action
  confirmCallback() {
    this.deleteSlackConfig.perform();
  }

  @action saveSelectedRiskThreshold() {
    this.selectRiskThreshold.perform();
    this.isEditing = false;
  }

  @action openSlackRiskEditModal() {
    this.showEditSlackRiskModal = true;
  }

  @action closeSlackRiskEditModal() {
    this.showEditSlackRiskModal = false;
  }

  @action selectThreshold(threshold: number) {
    this.selectedThreshold = threshold;
  }

  @action configureSlackAdapterNamespace() {
    const adapter = this.store.adapterFor('slack-config');
    adapter.setNestedUrlNamespace(String(this.project?.id));
  }

  fetchSlackConfig = task(async () => {
    try {
      this.configureSlackAdapterNamespace();

      const config = await this.store.queryRecord('slack-config', {});

      this.slackConfig = config;
      this.selectedThreshold = config.riskThreshold;
    } catch (err) {
      const error = err as AdapterError;
      const errorInfo = error.errors?.[0];
      const errorDetail = errorInfo?.detail;

      if (errorDetail === 'Slack not integrated') {
        this.noIntegration = true;

        return;
      }

      if (errorDetail === 'Slack not connected') {
        this.noAccess = true;

        return;
      }

      if (errorDetail?.includes('Not Found')) {
        this.noIntegration = true;
        this.noAccess = true;

        return;
      }
    }
  });

  checkSlackIntegration = task(async () => {
    try {
      const data = await this.ajax.request<SlackCheckResponse>(this.baseURL);

      this.noIntegration = !data.api_token || !data.channel_id;
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.noIntegration = true;
      }
    }
  });

  deleteSlackConfig = task(async () => {
    try {
      this.configureSlackAdapterNamespace();

      await (this.slackConfig as SlackConfigModel).destroyRecord();

      this.notify.success(this.intl.t('slack.riskThresholdRemoved'));

      this.showDeleteSlackConfigConfirmBox = false;
      this.slackConfig = null;
      this.selectedThreshold = ENUMS.THRESHOLD.LOW;
    } catch (err) {
      this.notify.error(parseError(err));

      this.showDeleteSlackConfigConfirmBox = false;
    }
  });

  selectRiskThreshold = task(async () => {
    let slackConfig = this.slackConfig;

    const successMessage = slackConfig
      ? this.intl.t('slack.riskThresholdUpdated')
      : this.intl.t('slackIntegrated');

    if (slackConfig) {
      slackConfig.setProperties({ riskThreshold: this.selectedThreshold });
    } else {
      slackConfig = this.store.createRecord('slack-config', {
        riskThreshold: this.selectedThreshold,
        project: this.project,
      });
    }

    try {
      this.configureSlackAdapterNamespace();

      await (slackConfig as SlackConfigModel).save();

      this.slackConfig = slackConfig;
      this.showEditSlackRiskModal = false;

      this.notify.success(successMessage);
    } catch (err) {
      slackConfig.rollbackAttributes();

      if (slackConfig.get('dirtyType') === 'deleted') {
        slackConfig.unloadRecord();
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

      if (errorDetail === 'Slack not integrated') {
        this.showEditSlackRiskModal = false;
        this.slackConfig = null;
        this.noIntegration = true;
      }

      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::Slack': typeof ProjectSettingsIntegrationsSlackComponent;
  }
}
