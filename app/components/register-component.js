import Ember from 'ember';
import RegisterValidation from '../validations/register';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';

export default Ember.Component.extend({

  captcha: '',
  registerPOJO: {
    "username": "sharat",
    "company": "appknox",
    "email": "sharat@appknox.com"
  },
  serverErrors: {},
  success: false,

  init() {
    this._super(...arguments);
    const registerPOJO = this.get('registerPOJO');
    const changeset = new Changeset(
      registerPOJO, lookupValidator(RegisterValidation), RegisterValidation
    );
    this.set('changeset', changeset);
  },

  registerWithServer (data) {
    return this.get('ajax').request('/registration', {
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
          const username = changeset.get('username');
          const email = changeset.get('email');
          const password = changeset.get('password');
          const passwordConfirmation = changeset.get('passwordConfirmation');
          const companyName = changeset.get('company');
          const captcha = this.get('captcha');
          this.registerWithServer({
            'username': username,
            'email': email,
            'password': password,
            'confirm_password': passwordConfirmation,
            'company': companyName,
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
