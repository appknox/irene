import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';

const GithubAccountComponent = Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  organization: service(),
  isRevokingGithub: false,
  isIntegratingGithub: false,
  isIntegrated: false,
  integratedUser: null,
  tGithubWillBeRevoked: t("githubWillBeRevoked"),
  tGithubErrorIntegration: t("githubErrorIntegration"),

  redirectAPI: task(function * (){
    const url = `/api/organizations/${this.get('organization.selected.id')}/github/redirect`
    return yield this.get("ajax").request(url)
  }),
  integrateGithub: task(function *(){
    triggerAnalytics('feature',ENV.csb.integrateGithub);
    try{
      let data = yield this.get('redirectAPI').perform();
      window.location.href = data.url;
    }catch(err){
      this.get("notify").error(this.get('tGithubErrorIntegration'));
    }

  }),

  confirmCallback() {
    const tGithubWillBeRevoked = this.get("tGithubWillBeRevoked");
    this.set("isRevokingGithub", true);
    this.get("ajax").delete(`/api/organizations/${this.get('organization.selected.id')}/github`)
    .then(() => {
      this.get("notify").success(tGithubWillBeRevoked);
      if(!this.isDestroyed) {
        this.send("closeRevokeGithubConfirmBox");
        this.set('integratedUser', null);
        this.set("isRevokingGithub", false);
      }
    }, (error) => {
      if(!this.isDestroyed) {
        this.set("isRevokingGithub", false);
        this.get("notify").error(error.payload.error);
      }
    });
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
