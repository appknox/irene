import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
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

export interface GithubAccountSignature {
  Args: {
    integratedUser: IntegratedUserType | null;
    reconnect: boolean;
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class GithubAccountComponent extends Component<GithubAccountSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service declare organization: OrganizationService;

  @tracked showRevokeGithubConfirmBox = false;
  @tracked integratedUser: IntegratedUserType | null = null;

  tGithubWillBeRevoked: string;
  tGithubErrorIntegration: string;

  constructor(owner: unknown, args: GithubAccountSignature['Args']) {
    super(owner, args);

    this.tGithubWillBeRevoked = this.intl.t('githubWillBeRevoked');
    this.tGithubErrorIntegration = this.intl.t('githubErrorIntegration');

    this.integratedUser = this.args.integratedUser;
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

      this.integratedUser = null;
    } catch (e) {
      const err = e as AjaxError;

      this.notify.error(err.payload.detail);
    }
  });

  @action
  openRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = true;
  }

  @action
  closeRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    GithubAccount: typeof GithubAccountComponent;
  }
}
