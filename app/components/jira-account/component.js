import Component from '@ember/component';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import ENV from 'irene/config/environment';
import {
  t
} from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import {
  task
} from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import JIRAValidation from 'irene/validations/jiraintegrate';

const JiraAccountComponent = Component.extend({

  intl: service(),
  ajax: service(),
  organization: service(),
  notify: service('notifications'),
  user: null,
  jiraHost: "",
  jiraUsername: "",
  jiraPassword: "",
  jiraPOJO: {},

  isRevokingJIRA: false,
  isIntegratingJIRA: false,
  tInValidCredentials: t("tInValidCredentials"),
  tJiraIntegrated: t("jiraIntegrated"),
  tJiraWillBeRevoked: t("jiraWillBeRevoked"),
  tPleaseEnterAllDetails: t("pleaseEnterAllDetails"),
  isJIRAConnected: false,
  connectedHost: "",
  connectedUsername: "",
  init() {
    this._super(...arguments);
    const jiraPOJO = this.get('jiraPOJO');
    const changeset = new Changeset(
      jiraPOJO, lookupValidator(JIRAValidation), JIRAValidation
    );
    this.set('changeset', changeset);
  },
  didInsertElement() {
    this.get('checkJIRA').perform();
  },
  baseURL: computed('organization.selected.id', '', function () {
    return [
      '/api/organizations',
      this.get('organization.selected.id'), ENV.endpoints.integrateJira
    ].join('/')
  }),
  confirmCallback() {
    this.get('revokeJIRA').perform();
  },

  checkJIRA: task(function* () {
    try {
      const data = yield this.get("ajax").request(this.get('baseURL'));
      this.set("isJIRAConnected", true);
      this.set("connectedHost", data.host);
      this.set("connectedUsername", data.username);
    } catch (error) {
      if (error.status == 404) {
        this.set("isJIRAConnected", false);
      }
    }
  }).drop(),
  revokeJIRA: task(function* () {
    try {
      this.send("closeRevokeJIRAConfirmBox");
      yield this.get("ajax").delete(this.get('baseURL'));
      const tJiraWillBeRevoked = this.get("tJiraWillBeRevoked");
      this.get("notify").success(tJiraWillBeRevoked);
      this.get('checkJIRA').perform();
    } catch (error) {
      this.get("notify").error("Sorry something went wrong, please try again");
    }
  }).drop(),
  integrateJIRA: task(function* (changeset) {
    const tJiraIntegrated = this.get("tJiraIntegrated");
    yield changeset.validate()
    if (!changeset.get('isValid')) {
      if (changeset.get('errors') && changeset.get('errors')[0].validation) {
        this.get("notify").error(
          changeset.get('errors')[0].validation[0],
          ENV.notifications
        );
      }
      return;
    }
    const host = changeset.get('host').trim();
    const username = changeset.get('username').trim();
    const password = changeset.get('password');
    const data = {
      host,
      username,
      password
    };
    try {
      yield this.get("ajax").post(this.get('baseURL'), {
        data
      })
      this.get('checkJIRA').perform();
      this.get("notify").success(tJiraIntegrated);
      triggerAnalytics('feature', ENV.csb.integrateJIRA);
    } catch (error) {
      if (error.payload) {
        if (error.payload.host) {
          this.get("notify").error(error.payload.host[0], ENV.notifications)
        }
        if (error.payload.username || error.payload.password) {
          this.get("notify").error(this.get('tInValidCredentials'))
        }
      }
    }
  }).drop(),
  actions: {
    openRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", true);
    },

    closeRevokeJIRAConfirmBox() {
      this.set("showRevokeJIRAConfirmBox", false);
    }
  }
});

export default JiraAccountComponent;
