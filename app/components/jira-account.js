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

const JiraAccountComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),

  user: null,
  jiraHost: "",
  jiraUsername: "",
  jiraPassword: "",

  tJiraIntegrated: t("jiraIntegrated"),
  tJiraWillBeRevoked: t("jiraWillBeRevoked"),
  tPleaseEnterAllDetails: t("pleaseEnterAllDetails"),


  confirmCallback() {
    const tJiraWillBeRevoked = this.get("tJiraWillBeRevoked");
    const that = this;
    return this.get("ajax").post(ENV.endpoints.revokeJira)
    .then(function(data) {
      that.get("notify").success(tJiraWillBeRevoked);
      that.send("closeRevokeJIRAConfirmBox");
      return that.set("user.hasJiraToken", false);}).catch(error =>
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

    integrateJira() {
      const tJiraIntegrated = this.get("tJiraIntegrated");
      const tPleaseEnterAllDetails = this.get("tPleaseEnterAllDetails");
      const host =  this.get("jiraHost").trim();
      const username =  this.get("jiraUsername").trim();
      const password =  this.get("jiraPassword");
      if (!host || !username || !password) {
        return this.get("notify").error(tPleaseEnterAllDetails, ENV.notifications);
      }
      const that = this;
      const data = {
        host,
        username,
        password
      };
      return this.get("ajax").post(ENV.endpoints.integrateJira, {data})
      .then(function(data){
        that.get("notify").success(tJiraIntegrated);
        return triggerAnalytics('feature',ENV.csb.integrateJIRA);}).catch(function(error) {
        that.get("notify").error(error.payload.message);
        return (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })();
      });
    },

    openRevokeJIRAConfirmBox() {
      return this.set("showRevokeJIRAConfirmBox", true);
    },

    closeRevokeJIRAConfirmBox() {
      return this.set("showRevokeJIRAConfirmBox", false);
    }
  }
});

export default JiraAccountComponent;
