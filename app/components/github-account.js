import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const GithubAccountComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  isRevokingGithub: false,
  isIntegratingGithub: false,

  tGithubWillBeRevoked: t("githubWillBeRevoked"),

  confirmCallback() {
    const tGithubWillBeRevoked = this.get("tGithubWillBeRevoked");
    const that = this;
    this.set("isRevokingGithub", true);
    this.get("ajax").post(ENV.endpoints.revokeGitHub)
    .then(function(data) {
      that.get("notify").success(tGithubWillBeRevoked);
      that.send("closeRevokeGithubConfirmBox");
      that.set("user.hasGithubToken", false);
      that.set("isRevokingGithub", false);
    })
    .catch(function(error) {
      that.set("isRevokingGithub", false);
      that.get("notify").error(error.payload.error);
    });
  },

  actions: {

    integrateGithub() {
      triggerAnalytics('feature',ENV.csb.integrateGithub);
      window.open(this.get("user.githubRedirectUrl", '_blank'));
    },

    openRevokeGithubConfirmBox() {
      this.set("showRevokeGithubConfirmBox", true);
    },

    closeRevokeGithubConfirmBox() {
      this.set("showRevokeGithubConfirmBox", false);
    }
  }
});

export default GithubAccountComponent;
