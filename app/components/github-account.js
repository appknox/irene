import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const GithubAccountComponent = Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),

  isRevokingGithub: false,
  isIntegratingGithub: false,

  tGithubWillBeRevoked: t("githubWillBeRevoked"),

  confirmCallback() {
    const tGithubWillBeRevoked = this.get("tGithubWillBeRevoked");
    this.set("isRevokingGithub", true);
    this.get("ajax").post(ENV.endpoints.revokeGitHub)
    .then(() => {
      this.get("notify").success(tGithubWillBeRevoked);
      if(!this.isDestroyed) {
        this.send("closeRevokeGithubConfirmBox");
        this.set("user.hasGithubToken", false);
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
