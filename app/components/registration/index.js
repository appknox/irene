import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default class RegistrationComponent extends Component {
  @service network;
  @service('notifications') notify;
  @tracked registerPOJO = {};
  @tracked showSuccess = false;

  registrationEndpoint = 'v2/registration';

  registrationValidatorWithoutName = {
    email: validateFormat({ type: 'email' }),
    company: validatePresence(true),
  };

  registrationValidatorWithName = {
    email: validateFormat({ type: 'email' }),
    company: validatePresence(true),
    firstname: validatePresence(true),
    lastname: validatePresence(true),
  };

  constructor() {
    super(...arguments);
    this.changeset = new Changeset(
      this.registerPOJO,
      lookupValidator(this.registrationValidator),
      this.registrationValidator,
      { skipValidate: true }
    );
  }

  get enabledName() {
    return this.args.enable_name == true;
  }

  get enableReCaptcha() {
    return this.args.enable_recaptcha == true;
  }

  get registrationValidator() {
    if (this.enabledName) {
      return this.registrationValidatorWithName;
    }
    return this.registrationValidatorWithoutName;
  }

  @task(function* (data) {
    const url = this.registrationEndpoint;
    try {
      const res = yield this.network.post(url, data);
      if (!res.ok) {
        const err = new Error(res.statusText);
        try {
          const error_payload = yield res.json();
          err.payload = error_payload;
        } catch {
          err.message = yield res.text();
        }
        throw err;
      }
      this.showSuccess = true;
    } catch (errors) {
      if (!errors.payload) {
        this.notify.error(errors.message);
        return;
      }
      if (errors.payload.recaptcha && errors.payload.recaptcha.length) {
        this.notify.error(errors.payload.recaptcha[0]);
        return;
      }
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
      const email = changeset.get('email');
      const companyName = changeset.get('company');

      const data = {
        email: email,
        company: companyName,
      };

      if (this.enabledName) {
        const firstname = changeset.get('firstname');
        const lastname = changeset.get('lastname');
        data['first_name'] = firstname;
        data['last_name'] = lastname;
      }

      let recaptchaValue = 'notenabled';
      if (this.enableReCaptcha && window.grecaptcha) {
        recaptchaValue = yield window.grecaptcha.execute({
          action: 'registration',
        });
      }
      data['recaptcha'] = recaptchaValue;
      yield this.registerWithServer.perform(data);
    }
  })
  registerTask;

  @action
  register(changeset) {
    this.registerTask.perform(changeset);
  }
}
