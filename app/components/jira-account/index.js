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

export default class JiraAccountComponent extends Component {
  @service intl;
  @service ajax;
  @service organization;
  @service('notifications') notify;

  user = null;

  @tracked jiraHost = '';
  @tracked jiraUsername = '';
  @tracked jiraPassword = '';
  @tracked jiraPOJO = {};

  @tracked isRevokingJIRA = false;
  @tracked isIntegratingJIRA = false;

  tInValidCredentials = this.intl.t('tInValidCredentials');
  tJiraIntegrated = this.intl.t('jiraIntegrated');
  tJiraWillBeRevoked = this.intl.t('jiraWillBeRevoked');
  tPleaseEnterAllDetails = this.intl.t('pleaseEnterAllDetails');
  tPleaseTryAgain = this.intl.t('pleaseTryAgain');

  @tracked isJIRAConnected = false;
  @tracked connectedHost = '';
  @tracked connectedUsername = '';
  @tracked showRevokeJIRAConfirmBox = false;

  constructor() {
    super(...arguments);

    const jiraPOJO = this.jiraPOJO;

    const changeset = new Changeset(
      jiraPOJO,
      lookupValidator(JIRAValidation),
      JIRAValidation
    );

    this.changeset = changeset;

    this.checkJIRA.perform();
  }

  get baseURL() {
    return [
      '/api/organizations',
      this.organization.selected.id,
      ENV.endpoints.integrateJira,
    ].join('/');
  }

  confirmCallback() {
    this.revokeJIRA.perform();
  }

  @task
  *checkJIRA() {
    try {
      const data = yield this.ajax.request(this.baseURL);

      this.isJIRAConnected = true;
      this.connectedHost = data.host;
      this.connectedUsername = data.username;
    } catch (error) {
      if (error.status == 404) {
        this.isJIRAConnected = false;
      }
    }
  }

  @task
  *revokeJIRA() {
    try {
      yield this.ajax.delete(this.baseURL);

      this.closeRevokeJIRAConfirmBox();

      this.notify.success(this.tJiraWillBeRevoked);

      this.checkJIRA.perform();
    } catch (error) {
      this.notify.error(this.tPleaseTryAgain);
    }
  }

  @task
  *integrateJIRA(changeset) {
    yield changeset.validate();

    if (!changeset.isValid) {
      if (changeset.errors && changeset.errors[0].validation) {
        this.notify.error(changeset.errors[0].validation[0], ENV.notifications);
      }

      return;
    }

    const data = {
      host: changeset.host.trim(),
      username: changeset.username.trim(),
      password: changeset.password,
    };

    try {
      yield this.ajax.post(this.baseURL, { data });

      this.checkJIRA.perform();

      this.notify.success(this.tJiraIntegrated);
      triggerAnalytics('feature', ENV.csb.integrateJIRA);
    } catch (error) {
      if (error.payload) {
        if (error.payload.host) {
          this.notify.error(error.payload.host[0], ENV.notifications);
        } else if (error.payload.username || error.payload.password) {
          this.notify.error(this.tInValidCredentials);
        } else {
          this.notify.error(this.tPleaseTryAgain);
        }
      }
    }
  }

  @action
  openRevokeJIRAConfirmBox() {
    this.showRevokeJIRAConfirmBox = true;
  }

  @action
  closeRevokeJIRAConfirmBox() {
    this.showRevokeJIRAConfirmBox = false;
  }
}
