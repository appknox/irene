import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

export default class GithubAccountComponent extends Component {
  @service('notifications') notify;
  @service intl;
  @service ajax;
  @service organization;

  @tracked isShowDisconnectConfirmBox = false;
  @tracked integratedUser = this.args.integratedUser;

  @action toggleDisconnectConfirmBox() {
    this.isShowDisconnectConfirmBox = !this.isShowDisconnectConfirmBox;
  }

  @action onIntegrateGithub() {
    this.integrateGitHub.perform();
  }

  @action onRemoveIntegration() {
    this.removeIntegration.perform();
  }

  @task(function* () {
    try {
      triggerAnalytics('feature', ENV.csb.integrateGithub);
      let data = yield this.redirectAPI.perform();
      window.location.href = data.url;
    } catch (_) {
      this.notify.error(this.intl.t('githubErrorIntegration'));
    }
  })
  integrateGitHub;

  @task(function* () {
    return yield this.ajax.request(
      `/api/organizations/${this.organization.selected.id}/github/redirect`
    );
  })
  redirectAPI;

  @task(function* () {
    return yield this.ajax.delete(
      `/api/organizations/${this.organization.selected.id}/github`
    );
  })
  removeIntegrationURI;

  @task(function* () {
    try {
      yield this.removeIntegrationURI.perform();
      this.toggleDisconnectConfirmBox();
      this.integratedUser = null;
      this.notify.success(this.intl.t('githubWillBeRevoked'));
    } catch (err) {
      this.notify.error(parseError(err));
    }
  })
  removeIntegration;
}
