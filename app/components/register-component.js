import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import RegisterValidation from '../validations/register';

export default Component.extend({

  captcha: '',
  registerPOJO: {},
  serverErrors: {},
  success: false,

  ajax: service(),
  notify: service('notification-messages-service'),

  init() {
    this._super(...arguments);
    const registerPOJO = this.get('registerPOJO');
    const changeset = new Changeset(
      registerPOJO, lookupValidator(RegisterValidation), RegisterValidation
    );
    this.set('changeset', changeset);
  },

  registerWithServer (data) {
    return this.get('ajax').request(ENV.endpoints.registration, {
      method: 'POST',
      data: data
    }).then(() => {
      this.set('success', true);
    }, (errors) => {
      this.get('gRecaptcha').resetReCaptcha();
      const changeset = this.get('changeset');
      Object.keys(errors.payload).forEach(key => {
        changeset.addError(key, errors.payload[key]);
      });
    });
  },

  actions: {
    register(changeset) {
      changeset.validate().then(() => {
        if (changeset.get('isValid')) {
          const firstname = changeset.get('firstname');
          const lastname = changeset.get('lastname');
          const username = changeset.get('username');
          const email = changeset.get('email');
          const password = changeset.get('password');
          const passwordConfirmation = changeset.get('passwordConfirmation');
          const companyName = changeset.get('company');
          const phoneNumber = changeset.get('phone');
          const selectedCountryData = this.get("selectedCountryData");
          const fullNumber = selectedCountryData.dialCode + '-' +  phoneNumber;
          const termsAccepted = changeset.get('termsAccepted');
          const captcha = this.get('captcha');
          this.registerWithServer({
            'first_name': firstname,
            'last_name': lastname,
            'username': username,
            'email': email,
            'password': password,
            'confirm_password': passwordConfirmation,
            'company': companyName,
            'phone': fullNumber,
            'terms_accepted': termsAccepted,
            'recaptcha': captcha,
          });
        }
      });
    },
    onCaptchaResolved(data) {
      this.set('captcha', data);
    }
  },
});
