import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';

import {
  validatePresence,
  validateFormat,
} from 'ember-changeset-validations/validators';

import NetworkService from 'irene/services/network';
import { ChangesetBufferProps } from '../form';
import IntlService from 'ember-intl/services/intl';

interface RegistrationComponentSignature {
  Args: {
    enable_name: boolean;
    enable_recaptcha: boolean;
    showLoginLink: boolean;
  };
  Blocks: {
    default: [];
  };
}

interface RegistrationData {
  email: string;
  company: string;
  first_name?: string;
  last_name?: string;
  recaptcha?: string;
}

export default class RegistrationComponent extends Component<RegistrationComponentSignature> {
  @service declare network: NetworkService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked registerPOJO = {};
  @tracked showSuccess = false;
  @tracked changeset: ChangesetBufferProps;

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

  constructor(owner: unknown, args: RegistrationComponentSignature['Args']) {
    super(owner, args);

    this.changeset = Changeset(
      this.registerPOJO,
      lookupValidator(this.registrationValidator),
      this.registrationValidator,
      { initValidate: true }
    ) as ChangesetBufferProps;
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

  registerWithServer = task(async (data) => {
    const url = this.registrationEndpoint;

    try {
      const res = await this.network.post(url, data);

      if (!res.ok) {
        const err = new Error(res.statusText) as AdapterError;

        try {
          const error_payload = await res.json();

          err.payload = error_payload;
        } catch {
          err.message = await res.text();
        }

        throw err;
      }

      this.showSuccess = true;
    } catch (err) {
      const errors = err as AdapterError;
      const changeset = this.changeset;

      if (errors.payload.recaptcha && errors.payload.recaptcha.length) {
        this.notify.error(errors.payload.recaptcha[0]);
        return;
      }

      if (!errors.message && errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          if (changeset.validationMap && key in changeset.validationMap) {
            changeset.addError(key, errors.payload[key]);
          } else {
            this.notify.error(this.intl.t('somethingWentWrong'));
            return;
          }
        });
      } else if (errors.message) {
        this.notify.error(errors.message);
        return;
      }
    }
  });

  registerTask = task(async (changeset) => {
    await changeset.validate();

    if (changeset.get('isValid')) {
      const email = changeset.get('email');
      const company = changeset.get('company');

      const data: RegistrationData = {
        email,
        company,
      };

      if (this.enabledName) {
        data['first_name'] = changeset.get('firstname');
        data['last_name'] = changeset.get('lastname');
      }

      let recaptchaValue = 'notenabled';

      if (this.enableReCaptcha && window.grecaptcha) {
        recaptchaValue = await window.grecaptcha.execute({
          action: 'registration',
        });
      }

      data['recaptcha'] = recaptchaValue;

      await this.registerWithServer.perform(data);
    }
  });

  @action
  register(changeset: ChangesetBufferProps) {
    this.registerTask.perform(changeset);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::ViaLoginPage': typeof RegistrationComponent;
  }
}
