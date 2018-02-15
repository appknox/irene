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

  isRevokingJIRA: false,
  isIntegratingJIRA: false,

  tJiraIntegrated: t("jiraIntegrated"),
  tJiraWillBeRevoked: t("jiraWillBeRevoked"),
  tPleaseEnterAllDetails: t("pleaseEnterAllDetails"),


  confirmCallback() {
    const tJiraWillBeRevoked = this.get("tJiraWillBeRevoked");
    const that = this;
    this.set("isRevokingJIRA", true);
    this.get("ajax").post(ENV.endpoints.revokeJira)
    .then(function(data) {
      that.set("isRevokingJIRA", false);
      that.get("notify").success(tJiraWillBeRevoked);
      that.send("closeRevokeJIRAConfirmBox");
      that.set("user.hasJiraToken", false);})
    .catch(function(error) {
      that.set("isRevokingJIRA", false);
      that.get("notify").error(error.payload.error);
    });
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
      this.set("isIntegratingJIRA", true);
      this.get("ajax").post(ENV.endpoints.integrateJira, {data})
      .then(function(data){
        that.set("isIntegratingJIRA", false);
        that.get("notify").success(tJiraIntegrated);
        triggerAnalytics('feature',ENV.csb.integrateJIRA);})
      .catch(function(error) {
        that.set("isIntegratingJIRA", false);
        that.get("notify").error(error.payload.message);
      });
    },

    openRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", true);
    },

    closeRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", false);
    }
  }
});

export default JiraAccountComponent;
