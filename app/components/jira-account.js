import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const JiraAccountComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
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
    this.set("isRevokingJIRA", true);
    this.get("ajax").post(ENV.endpoints.revokeJira)
    .then(() => {
      this.get("notify").success(tJiraWillBeRevoked);
      if(!this.isDestroyed) {
        this.set("isRevokingJIRA", false);
        this.set("user.hasJiraToken", false);
        this.send("closeRevokeJIRAConfirmBox");
      }
    }, (error) => {
      if(!this.isDestroyed) {
        this.set("isRevokingJIRA", false);
        this.get("notify").error(error.payload.error);
      }
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
      const data = {
        host,
        username,
        password
      };
      this.set("isIntegratingJIRA", true);
      this.get("ajax").post(ENV.endpoints.integrateJira, {data})
      .then(() => {
        if(!this.isDestroyed) {
          this.set("isIntegratingJIRA", false);
          this.set("user.hasJiraToken", true);
        }
        this.get("notify").success(tJiraIntegrated);
        triggerAnalytics('feature',ENV.csb.integrateJIRA);
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isIntegratingJIRA", false);
          this.get("notify").error(error.payload.message);
        }
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
