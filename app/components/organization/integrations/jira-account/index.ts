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
import triggerAnalytics from 'irene/utils/trigger-analytics';
import JIRAValidation from 'irene/validations/jiraintegrate';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type UserModel from 'irene/models/user';
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
  }

  get data() {
    return {
      id: 'JIRA',
      title: this.intl.t('jira'),
      description: this.intl.t('jiraIntegrationDesc'),
      logo: '../../../images/jira-icon.png',
      isIntegrated: this.isJIRAConnected,
    };
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

  @action
  openDrawer() {
    this.integrationDrawerIsOpen = true;
  }

  @action
  closeDrawer() {
    this.integrationDrawerIsOpen = false;
  }

  confirmCallback() {
    this.revokeJIRA.perform();
  }

  checkJIRA = task(async () => {
    try {
      const data = await this.ajax.request<JiraCheckResponse>(this.baseURL);

      this.isJIRAConnected = true;
      this.connectedHost = data.host;
      this.connectedUsername = data.username;
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
      if (changeset.errors && changeset.errors[0].validation) {
        this.notify.error(changeset.errors[0].validation, ENV.notifications);
      }

      return;
    }

    const data = {
      host: changeset.host.trim(),
      username: changeset.username.trim(),
      password: changeset.password,
    };

    try {
      await this.ajax.post(this.baseURL, { data });

      this.checkJIRA.perform();

      this.notify.success(this.tJiraIntegrated);

      triggerAnalytics(
        'feature',
        ENV.csb['integrateJIRA'] as CsbAnalyticsFeatureData
      );
    } catch (err) {
      const error = err as AjaxError;

      if (error.payload) {
        if (error.payload.host) {
          this.notify.error(error.payload.host[0], ENV.notifications);
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
