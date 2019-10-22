import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import {
  validatePresence,
  validateConfirmation
} from 'ember-changeset-validations/validators';
import { promise } from 'ember-awesome-macros';

const ResetValidator = {
  password: [
    validatePresence(true)
  ],
  confirm_password: validateConfirmation({ on: 'password' }),
};

const PasswordResetComponent = Component.extend({
  resetURL: ENV.endpoints.reset,
  intl: service(),
  ajax: service(),
  router: service(),
  notify: service('notification-messages-service'),
  token: "",
  isResettingPassword: false,
  tPasswordLengthError: t("passwordLengthError"),
  tPasswordMatchError: t("passwordMatchError"),
  tPasswordIsReset: t("passwordIsReset"),

  validation_errors: [],
  model: {},
  url: computed('resetURL','token', function(){
    return [this.get('resetURL'), this.get('token')].join("/");
  }),
  init() {
    this._super(...arguments);
    const model = this.get('model');
    const changeset = new Changeset(
      model, lookupValidator(ResetValidator), ResetValidator
    );
    this.set('changeset', changeset);
    window.test = this;
  },
  verify_token: task(function*() {
    const url = this.get('url');
    try{
      yield this.get("ajax").request(url);
    } catch (error) {
      return false;
    }
    return true;
  }),
  isVerified: promise.object(computed('token', function(){
    return this.get('verify_token').perform();
  })),
  isNotVerified: promise.object(computed('isVerified', async function(){
    return !(await this.get('isVerified'));
  })),
  reset: task(function*(){
    const changeset = this.get('changeset');
    yield changeset.validate();
    if(!changeset.get('isValid')) {
      return;
    }
    const password = changeset.get('password');
    const confirm_password = changeset.get('confirm_password');
    const url = this.get('url');
    try {
      yield this.get("ajax").put(url, {
        data: {
          password: password,
          confirm_password: confirm_password
        }
      })
      this.get('router').transitionTo("login");
      this.get("notify").success(this.get("tPasswordIsReset"));
    } catch(errors) {
      if(errors.payload) {
        Object.keys(errors.payload).forEach(key => {
          changeset.addError(key, errors.payload[key]);
        });
        return;
      }
      this.get("notify").error(this.get('tSomethingWentWrong'));
      this.get("logger").error("Reset password error", errors);
    }
  }),
  validate() {
    this.validation_errors = [];
    const password = this.get("password");

    const tPasswordLengthError = this.get("tPasswordLengthError");
    const tPasswordMatchError = this.get("tPasswordMatchError");

    if (password.length < 6) {
      this.validation_errors.push(tPasswordLengthError);
      return this.validation_errors;
    }
    const confirmPassword = this.get("confirmPassword");
    if (password !== confirmPassword) {
      this.validation_errors.push(tPasswordMatchError);
      return this.validation_errors;
    }
  },

  actions: {

    reset() {
      const tPasswordIsReset = this.get("tPasswordIsReset");
      this.validate();
      if (this.validation_errors.length > 0) {
        return this.get("notify").error(`${this.validation_errors.join(" & ")}`);
      }
      const password = this.get("password");
      const uuid = this.get("uuid");
      const token = this.get("token");
      const data = {
        uuid,
        token,
        password
      };
      this.set("isResettingPassword", true);
      this.get("ajax").post(ENV.endpoints.reset, {data})
      .then(() => {
        if(!this.isDestroyed) {
          this.container.lookup("route:reset").transitionTo("login");
        }
        this.get("notify").success(tPasswordIsReset);
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isResettingPassword", false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  }
});

export default PasswordResetComponent;
