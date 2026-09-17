import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { Changeset } from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import JIRAValidation from 'irene/validations/jiraintegrate';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type AnalyticsService from 'irene/services/analytics';
import type UserModel from 'irene/models/user';
import type { ConnectionStatus } from 'irene/components/organization/integrations/jira-security';
import type { AjaxError } from 'irene/services/ajax';

type JIRAIntegrationFields = {
  username: string;
  password: string;
  host: string;
};

type ChangesetBufferProps = BufferedChangeset &
  JIRAIntegrationFields & {
    error: { [key in keyof JIRAIntegrationFields]: boolean };
  };

interface JiraCheckResponse {
  host: string;
  username: string;
  is_data_center?: boolean;
}

export interface OrganizationIntegrationsJiraAccountSignature {
  Args: {
    user: UserModel;
  };
}

export default class OrganizationIntegrationsJiraAccountComponent extends Component<OrganizationIntegrationsJiraAccountSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service declare analytics: AnalyticsService;
  @service('notifications') declare notify: NotificationService;

  user: null = null;
  changeset: ChangesetBufferProps;

  @tracked jiraHost = '';
  @tracked jiraUsername = '';
  @tracked jiraPassword = '';
  @tracked jiraPOJO: Record<string, unknown> = {};

  @tracked isRevokingJIRA = false;

  tInValidCredentials: string;
  tJiraIntegrated: string;
  tJiraWillBeRevoked: string;
  tPleaseEnterAllDetails: string;
  tPleaseTryAgain: string;

  @tracked isJIRAConnected = false;
  @tracked connectedHost = '';
  @tracked connectedUsername = '';
  @tracked showRevokeJIRAConfirmBox = false;
  @tracked integrationDrawerIsOpen = false;

  @tracked jiraType: 'cloud' | 'dataCenter' | 'cloudSecurity' = 'cloud';
  @tracked isJiraDataCenter = false;
  @tracked jiraSecurityStatus: ConnectionStatus = 'not_connected';
  @tracked connectedIsDataCenter = false;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsJiraAccountSignature['Args']
  ) {
    super(owner, args);

    this.tInValidCredentials = this.intl.t('tInValidCredentials');
    this.tJiraIntegrated = this.intl.t('jiraIntegrated');
    this.tJiraWillBeRevoked = this.intl.t('jiraWillBeRevoked');
    this.tPleaseEnterAllDetails = this.intl.t('pleaseEnterAllDetails');
    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');

    const jiraPOJO = this.jiraPOJO;

    this.changeset = Changeset(
      jiraPOJO,
      lookupValidator(JIRAValidation),
      JIRAValidation
    ) as ChangesetBufferProps;

    this.checkJIRA.perform();
    this.checkJiraSecurity.perform();
  }

  get data() {
    return {
      id: 'JIRA',
      title: this.intl.t('jira'),
      description: this.intl.t('jiraIntegrationDesc'),
      logo: '../../../images/jira-icon.png',
      isIntegrated: this.isJIRAConnected || this.isJiraSecurityConnected,
    };
  }

  get jiraSecurityURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateJiraSecurity'],
    ].join('/');
  }

  get isJiraCloudSecurity() {
    return this.jiraType === 'cloudSecurity';
  }

  get isJiraSecurityConnected() {
    return this.jiraSecurityStatus === 'connected';
  }

  get hasJiraSecuritySetup() {
    return this.jiraSecurityStatus !== 'not_connected';
  }

  get isOtherJiraIntegrationInUse() {
    return this.isJIRAConnected || this.hasJiraSecuritySetup;
  }

  get defaultJiraType(): typeof this.jiraType {
    if (this.isJIRAConnected) {
      return this.connectedIsDataCenter ? 'dataCenter' : 'cloud';
    }

    if (this.hasJiraSecuritySetup) {
      return 'cloudSecurity';
    }

    return 'cloud';
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected?.id,
      ENV.endpoints['integrateJira'],
    ].join('/');
  }

  get isLoadingJIRAIntegrationInfo() {
    return this.checkJIRA.isRunning;
  }

  get showIntegratedOrLoadingUI() {
    return this.isJIRAConnected || this.isLoadingJIRAIntegrationInfo;
  }

  get passwordLabel() {
    return this.isJiraDataCenter
      ? this.intl.t('accessToken')
      : this.intl.t('apiKey');
  }

  @action
  openDrawer() {
    this.setJiraType(this.defaultJiraType);

    this.integrationDrawerIsOpen = true;
  }

  @action
  closeDrawer() {
    this.integrationDrawerIsOpen = false;
  }

  @action
  handleJiraTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;

    this.setJiraType(target.value as typeof this.jiraType);
  }

  setJiraType(jiraType: typeof this.jiraType) {
    this.jiraType = jiraType;

    // Drives which credential the form asks for, so it has to move in step.
    this.isJiraDataCenter = jiraType === 'dataCenter';
  }

  @action
  handleJiraSecurityStatusChange(status: ConnectionStatus) {
    this.jiraSecurityStatus = status;
  }

  confirmCallback() {
    this.revokeJIRA.perform();
  }

  checkJiraSecurity = task(async () => {
    try {
      const data = await this.ajax.request<{ status: ConnectionStatus }>(
        this.jiraSecurityURL
      );

      this.jiraSecurityStatus = data.status;
    } catch {
      this.jiraSecurityStatus = 'not_connected';
    }
  });

  checkJIRA = task(async () => {
    try {
      const data = await this.ajax.request<JiraCheckResponse>(this.baseURL);

      this.isJIRAConnected = true;
      this.connectedHost = data.host;
      this.connectedUsername = data.username;
      this.connectedIsDataCenter = Boolean(data.is_data_center);
    } catch (err) {
      const error = err as AjaxError;

      if (error.status === 404) {
        this.isJIRAConnected = false;
      }
    }
  });

  revokeJIRA = task(async () => {
    try {
      await this.ajax.delete(this.baseURL);

      this.closeRevokeJIRAConfirmBox();

      this.notify.success(this.tJiraWillBeRevoked);

      this.checkJIRA.perform();
    } catch (error) {
      this.notify.error(this.tPleaseTryAgain);
    }
  });

  integrateJIRA = task(async (changeset) => {
    await changeset.validate();

    if (!changeset.isValid) {
      if (!this.changeset.password || this.changeset.password.trim() === '') {
        this.notify.error(
          `${this.passwordLabel} ${this.intl.t('canNotBeEmpty')}`
        );

        return;
      }

      if (changeset.errors && changeset.errors[0].validation) {
        this.notify.error(changeset.errors[0].validation, ENV.notifications);
      }

      return;
    }

    const data = {
      host: changeset.host.trim(),
      username: changeset.username.trim(),
      password: changeset.password,
      is_data_center: this.isJiraDataCenter,
    };

    try {
      await this.ajax.post(this.baseURL, { data });

      this.checkJIRA.perform();

      this.notify.success(this.tJiraIntegrated);

      this.analytics.track({
        name: 'INTEGRATION_INITIATED_EVENT',
        properties: {
          feature: 'jira_integration_completed',
        },
      });
    } catch (err) {
      const error = err as AjaxError;

      if (error.payload) {
        if (error.payload.host) {
          this.notify.error(error.payload.host[0], ENV.notifications);
        } else if (error.payload.detail) {
          this.notify.error(error.payload.detail as string, ENV.notifications);
        } else if (error.payload.username || error.payload.password) {
          this.notify.error(this.tInValidCredentials);
        } else {
          this.notify.error(this.tPleaseTryAgain);
        }
      }
    }
  });

  @action
  openRevokeJIRAConfirmBox() {
    this.showRevokeJIRAConfirmBox = true;
  }

  @action
  closeRevokeJIRAConfirmBox() {
    this.showRevokeJIRAConfirmBox = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::JiraAccount': typeof OrganizationIntegrationsJiraAccountComponent;
  }
}
