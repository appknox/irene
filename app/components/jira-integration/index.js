import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import JIRAValidation from '../../validations/jiraintegrate';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';

export default class JiraIntegration extends Component {
  @service intl;
  @service ajax;
  @service('notifications') notify;
  @service organization;

  @tracked isJIRAIntegrated = false;
  @tracked connectedHost = null;
  @tracked connectedUsername = '';
  @tracked isIntegratedByCred = false;
  @tracked isIntegratedByCloud = false;
  @tracked isJiraCloudEnabled = ENV.showJiraCloud;
  @tracked showRevokeJIRAConfirmBox = false;
  @tracked changeset = {};

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected.id,
      ENV.endpoints.integrateJira,
    ].join('/');
  }

  @action
  initComp() {
    this.checkJIRA.perform();
    this.changeset = new Changeset(
      {},
      lookupValidator(JIRAValidation),
      JIRAValidation
    );
  }

  @action
  onRevokeJira() {
    this.toggleConfirmBox();
    this.revokeJIRA.perform();
  }

  @action
  toggleConfirmBox() {
    this.showRevokeJIRAConfirmBox = !this.showRevokeJIRAConfirmBox;
  }

  @action
  onIntegrateJIRAByCred() {
    this.integrateJIRAByCred.perform();
  }

  @action
  onIntegrateJiraCloud() {
    this.integrateJiraCloud.perform();
  }

  @task(function* () {
    return yield this.ajax.request(
      `/api/integrations/jira-cloud/${this.organization.selected.id}/redirect/`
    );
  })
  redirectAPI;

  @task(function* () {
    try {
      const data = yield this.ajax.request(this.baseURL);
      if (data.type == 'jira_cloud_oauth') {
        this.isJIRAIntegrated = true;
        this.isIntegratedByCloud = true;
        this.connectedHost = data.accounts;
      } else if (data.type == 'jira') {
        this.isIntegratedByCred = true;
        this.isJIRAIntegrated = true;
        this.connectedHost = data.host;
        this.connectedUsername = data.username;
      }
    } catch (error) {
      if (error.status == 404) {
        this.isJIRAIntegrated = false;
      }
    }
  })
  checkJIRA;

  @task(function* () {
    try {
      yield this.ajax.delete(this.baseURL);
      this.notify.success(this.intl.t('jiraWillBeRevoked'));
      this.checkJIRA.perform();
    } catch (error) {
      this.notify.error(
        parseError(error),
        'Sorry something went wrong, please try again'
      );
    }
  })
  revokeJIRA;

  @task(function* () {
    yield this.changeset.validate();
    if (!this.changeset.get('isValid')) {
      if (
        this.changeset.get('errors') &&
        this.changeset.get('errors')[0].validation
      ) {
        this.notify.error(
          this.changeset.get('errors')[0].validation,
          ENV.notifications
        );
      }
      return;
    }
    const host = this.changeset.get('host').trim();
    const username = this.changeset.get('username').trim();
    const password = this.changeset.get('password');
    const data = {
      host,
      username,
      password,
    };
    try {
      yield this.ajax.post(this.baseURL, { data });
      this.checkJIRA.perform();
      this.notify.success(this.intl.t('jiraIntegrated'));
      triggerAnalytics('feature', ENV.csb.integrateJIRA);
    } catch (error) {
      if (error.payload) {
        if (error.payload.host) {
          this.notify.error(error.payload.host[0], ENV.notifications);
        }
        if (error.payload.username || error.payload.password) {
          this.notify.error(this.intl.t('inValidCredentials'));
        }
      }
    }
  })
  integrateJIRAByCred;

  @task(function* () {
    try {
      triggerAnalytics('feature', ENV.csb.integrateJIRACloud);
      let data = yield this.redirectAPI.perform();
      window.location.href = data.url;
    } catch (err) {
      this.notify.error(this.intl.t('tJiraErrorIntegration'));
    }
  })
  integrateJiraCloud;
}
