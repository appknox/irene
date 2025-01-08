import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { action } from '@ember/object';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class GithubAccountComponent extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service organization;

  @tracked showRevokeGithubConfirmBox = false;
  @tracked integratedUser;

  tGithubWillBeRevoked = this.intl.t('githubWillBeRevoked');
  tGithubErrorIntegration = this.intl.t('githubErrorIntegration');

  constructor() {
    super(...arguments);

    this.integratedUser = this.args.integratedUser;
  }

  redirectAPI = task(async () => {
    return await this.ajax.request(
      `/api/organizations/${this.organization.selected.id}/github/redirect`
    );
  });

  integrateGithub = task(async () => {
    try {
      triggerAnalytics('feature', ENV.csb.integrateGithub);

      let data = await this.redirectAPI.perform();

      window.location.href = data.url;
    } catch (error) {
      this.notify.error(this.tGithubErrorIntegration);
    }
  });

  removeIntegrationUri = task(async () => {
    return await this.ajax.delete(
      `/api/organizations/${this.organization.selected.id}/github`
    );
  });

  removeIntegration = task(async () => {
    try {
      await this.removeIntegrationUri.perform();

      this.notify.success(this.tGithubWillBeRevoked);

      this.closeRevokeGithubConfirmBox();

      this.integratedUser = null;
    } catch (err) {
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
