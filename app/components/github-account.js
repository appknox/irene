/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const GithubAccountComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  tGithubWillBeRevoked: t("githubWillBeRevoked"),

  confirmCallback() {
    const tGithubWillBeRevoked = this.get("tGithubWillBeRevoked");
    const that = this;
    return this.get("ajax").post(ENV.endpoints.revokeGitHub)
    .then(function(data) {
      that.get("notify").success(tGithubWillBeRevoked);
      that.send("closeRevokeGithubConfirmBox");
      return that.set("user.hasGithubToken", false);}).catch(error =>
      (() => {
        const result = [];
        for (error of Array.from(error.errors)) {
          result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
        }
        return result;
      })()
    );
  },

  actions: {

    integrateGithub() {
      triggerAnalytics('feature',ENV.csb.integrateGithub);
      return window.open(this.get("user.githubRedirectUrl", '_blank'));
    },

    openRevokeGithubConfirmBox() {
      return this.set("showRevokeGithubConfirmBox", true);
    },

    closeRevokeGithubConfirmBox() {
      return this.set("showRevokeGithubConfirmBox", false);
    }
  }
});

export default GithubAccountComponent;
