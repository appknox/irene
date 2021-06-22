import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import ENV from 'irene/config/environment';
import InviteOnlyRegisterValidation from '../../validations/register-invite';

export default class RegisterViaInvite extends Component {
  @service session;
  @service ajax;
  @service logger;

  @tracked toBeSubmittedData = {};
  @tracked initialData = {};
  @tracked invalid = false;

  inviteEndpoint = 'registration-via-invite';

  constructor() {
    super(...arguments);
    this.changeset = new Changeset(
      this.toBeSubmittedData,
      lookupValidator(InviteOnlyRegisterValidation),
      InviteOnlyRegisterValidation,
      { skipValidate: true }
    );
  }

  @task(function* () {
    const url = this.inviteEndpoint + '?token=' + this.args.token;
    try {
      const data = yield this.ajax.request(url, {
        namespace: ENV.namespace_v2,
      });
      this.initialData = data;
      this.changeset.set('company', data.company);
      this.changeset.set('first_name', data.first_name);
      this.changeset.set('last_name', data.last_name);
      return data;
    } catch (error) {
      this.logger.warn(error);
      this.invalid = true;
    }
  })
  loadTokenData;

  @task(function* (data) {
    const url = this.inviteEndpoint;
    try {
      const logininfo = yield this.ajax.post(url, {
        data: data,
        namespace: ENV.namespace_v2,
      });
      this.authenticate(logininfo);
    } catch (errors) {
      const changeset = this.changeset;
      Object.keys(errors.payload).forEach((key) => {
        changeset.addError(key, errors.payload[key]);
      });
    }
  })
  registerWithServer;

  @task(function* (changeset) {
    yield changeset.validate();
    if (changeset.get('isValid')) {
      const username = changeset.get('username');
      const password = changeset.get('password');
      const company = changeset.get('company');
      const first_name = changeset.get('first_name');
      const last_name = changeset.get('last_name');
      const passwordConfirmation = changeset.get('passwordConfirmation');
      const termsAccepted = changeset.get('termsAccepted');
      const token = this.args.token;
      yield this.registerWithServer.perform({
        token: token,
        username: username,
        password: password,
        confirm_password: passwordConfirmation,
        company: company,
        first_name: first_name,
        last_name: last_name,
        terms_accepted: termsAccepted,
      });
    }
  })
  registerTask;

  authenticate(data) {
    this.session.authenticate('authenticator:login', data);
  }

  @action
  fetchdata() {
    this.loadTokenData.perform();
  }

  @action
  register(changeset) {
    this.registerTask.perform(changeset);
  }
}
