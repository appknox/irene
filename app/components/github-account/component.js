import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';

const GithubAccountComponent = Component.extend({

  intl: service(),
  ajax: service('ajax'),
  notify: service('notifications'),
  organization: service('organization'),
  isRevokingGithub: false,
  isIntegratingGithub: false,
  isIntegrated: false,
  integratedUser: null,
  tGithubWillBeRevoked: t("githubWillBeRevoked"),
  tGithubErrorIntegration: t("githubErrorIntegration"),

  redirectAPI: task(function * (){
    return yield this.get("ajax").request(
      `/api/organizations/${this.get('organization.selected.id')}/github/redirect`
    )
  }),

  integrateGithub: task(function *(){
    triggerAnalytics('feature',ENV.csb.integrateGithub);
    let data = yield this.get('redirectAPI').perform()
    window.location.href = data.url;
  }).evented(),

  integrateGithubErrored: on('integrateGithub:errored', function(){
    this.get("notify").error(this.get('tGithubErrorIntegration'));
  }),

  removeIntegrationUri: task(function *(){
    return yield this.get("ajax").delete(
      `/api/organizations/${this.get('organization.selected.id')}/github`)
  }),

  removeIntegration: task(function *(){
    yield this.get('removeIntegrationUri').perform()
  }).evented(),

  removeIntegrationErrored: on('removeIntegration:errored', function(_, err){
    this.get("notify").error(err.payload.detail);
  }),

  removeIntegrationSucceded: on('removeIntegration:succeeded', function(){
    const tGithubWillBeRevoked = this.get("tGithubWillBeRevoked");
    this.get("notify").success(tGithubWillBeRevoked);
    this.send("closeRevokeGithubConfirmBox");
    this.set('integratedUser', null);
  }),

  confirmCallback() {
    this.get('removeIntegration').perform();
  },

  actions: {
    openRevokeGithubConfirmBox() {
      this.set("showRevokeGithubConfirmBox", true);
    },

    closeRevokeGithubConfirmBox() {
      this.set("showRevokeGithubConfirmBox", false);
    }
  }
});

export default GithubAccountComponent;
