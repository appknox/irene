import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';

const JiraCloudAccountComponent = Component.extend({

  intl: service(),
  ajax: service('ajax'),
  notify: service('notifications'),
  organization: service('organization'),
  isRevokingJIRA: false,
  isJIRAConnected: false,
  connectedHost: null,
  tJiraWillBeRevoked: t("jiraWillBeRevoked"),
  tJiraErrorIntegration: t("jiraErrorIntegration"),

  integrateJiraURL: computed('organization.selected.id', '', function () {
    return [
      '/api/organizations',
      this.get('organization.selected.id'), ENV.endpoints.integrateJira
    ].join('/')
  }),

  redirectAPI: task(function* () {
    return yield this.get("ajax").request(
      `/api/integrations/jira-cloud/${this.get('organization.selected.id')}/redirect/`
    )
  }),

  integrateJiraCloud: task(function* () {
    triggerAnalytics('feature', ENV.csb.integrateJIRACloud);
    let data = yield this.get('redirectAPI').perform()
    window.location.href = data.url;
  }).evented(),

  integrateJiraCloudErrored: on('integrateJiraCloud:errored', function () {
    this.get("notify").error(this.get('tJiraErrorIntegration'));
  }),

  removeIntegrationUri: task(function* () {
    return yield this.get("ajax").delete(this.get("integrateJiraURL"))
  }),

  didInsertElement() {
    this._super(...arguments);
    this.get('checkJIRA').perform();
  },

  checkJIRA: task(function* () {
    try {
      const data = yield this.get("ajax").request(this.get("integrateJiraURL"));
      if (data.type == "jira_cloud_oauth") {
        this.set("isJIRAConnected", true);
        this.set("connectedHost", data.connected_hosts)
      }
    } catch (error) {
      if (error.status == 404) {
        this.set("isJIRAConnected", false);
      }
    }
  }).drop(),

  removeIntegration: task(function* () {
    yield this.get('removeIntegrationUri').perform()
  }).evented(),

  removeIntegrationErrored: on('removeIntegration:errored', function (_, err) {
    this.get("notify").error(err.payload.detail);
  }),

  removeIntegrationSucceded: on('removeIntegration:succeeded', function () {
    this.get("notify").success(this.get("tJiraWillBeRevoked"));
    this.send("closeRevokeJIRAConfirmBox");
  }),

  confirmCallback() {
    this.get('removeIntegration').perform();
  },

  actions: {
    openRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", true);
    },

    closeRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", false);
    }
  }
});

export default JiraCloudAccountComponent;
