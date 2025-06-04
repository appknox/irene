import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';
import type { AjaxError } from 'irene/services/ajax';
import type UserModel from 'irene/models/user';

type IntegratedUserType = {
  avatar_url: string;
  created_on: string;
  html_url: string;
  login: string;
  name: string | null;
  updated_on: string;
};

type GithubRedirectResponse = {
  url: string;
};

export interface OrganizationIntegrationsGithubAccountSignature {
  Args: {
    integratedUser: IntegratedUserType | null;
    reconnect: boolean;
    user: UserModel;
  };
}

export default class OrganizationIntegrationsGithubAccountComponent extends Component<OrganizationIntegrationsGithubAccountSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare organization: OrganizationService;

  @tracked showRevokeGithubConfirmBox = false;
  @tracked integratedUser: IntegratedUserType | null = null;
  @tracked integrationDrawerIsOpen = false;

  tGithubWillBeRevoked: string;
  tGithubErrorIntegration: string;

  constructor(
    owner: unknown,
    args: OrganizationIntegrationsGithubAccountSignature['Args']
  ) {
    super(owner, args);

    this.tGithubWillBeRevoked = this.intl.t('githubWillBeRevoked');
    this.tGithubErrorIntegration = this.intl.t('githubErrorIntegration');

    this.integratedUser = this.args.integratedUser;
  }

  get data() {
    return {
      id: 'Github',
      title: this.intl.t('github'),
      description: this.intl.t('githubIntegrationDesc'),
      logo: '../../../images/github-icon.png',
      isIntegrated: !!this.integratedUser,
    };
  }

  @action
  openIntegrationDrawer() {
    this.integrationDrawerIsOpen = true;
  }

  @action
  closeIntegrationDrawer() {
    this.integrationDrawerIsOpen = false;
  }

  @action
  openRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = true;
  }

  @action
  closeRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = false;
  }

  confirmCallback() {
    this.removeIntegration.perform();
  }

  redirectAPI = task(async () => {
    return await this.ajax.request<GithubRedirectResponse>(
      `/api/organizations/${this.organization.selected?.id}/github/redirect`
    );
  });

  integrateGithub = task(async () => {
    try {
      triggerAnalytics(
        'feature',
        ENV.csb['integrateGithub'] as CsbAnalyticsFeatureData
      );

      const data = await this.redirectAPI.perform();

      window.location.href = data.url;
    } catch (error) {
      this.notify.error(this.tGithubErrorIntegration);
    }
  });

  removeIntegrationUri = task(async () => {
    return await this.ajax.delete(
      `/api/organizations/${this.organization.selected?.id}/github`
    );
  });

  removeIntegration = task(async () => {
    try {
      await this.removeIntegrationUri.perform();

      this.notify.success(this.tGithubWillBeRevoked);

      this.closeRevokeGithubConfirmBox();

      this.integrationDrawerIsOpen = false;

      this.integratedUser = null;
    } catch (e) {
      const err = e as AjaxError;

      this.notify.error(err.payload.detail);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::Integrations::GithubAccount': typeof OrganizationIntegrationsGithubAccountComponent;
  }
}
