import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { action } from '@ember/object';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';

export default class GithubAccountComponent extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service organization;

  @tracked showRevokeGithubConfirmBox = false;
  @tracked integratedUser = this.args.integratedUser;

  tGithubWillBeRevoked = this.intl.t('githubWillBeRevoked');
  tGithubErrorIntegration = this.intl.t('githubErrorIntegration');

  @task
  *redirectAPI() {
    return yield this.ajax.request(
      `/api/organizations/${this.organization.selected.id}/github/redirect`
    );
  }

  @task
  *integrateGithub() {
    try {
      triggerAnalytics('feature', ENV.csb.integrateGithub);

      let data = yield this.redirectAPI.perform();

      window.location.href = data.url;
    } catch (error) {
      this.notify.error(this.tGithubErrorIntegration);
    }
  }

  @task
  *removeIntegrationUri() {
    return yield this.ajax.delete(
      `/api/organizations/${this.organization.selected.id}/github`
    );
  }

  @task
  *removeIntegration() {
    try {
      yield this.removeIntegrationUri.perform();

      this.notify.success(this.tGithubWillBeRevoked);

      this.closeRevokeGithubConfirmBox();

      this.integratedUser = null;
    } catch (err) {
      this.notify.error(err.payload.detail);
    }
  }

  @action
  openRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = true;
  }

  @action
  closeRevokeGithubConfirmBox() {
    this.showRevokeGithubConfirmBox = false;
  }
}
