import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-intl';

const PasswordResetComponent = Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),

  uuid: "",
  token: "",
  password: "",
  confirmPassword: "",

  isResettingPassword: false,

  tPasswordLengthError: t("passwordLengthError"),
  tPasswordMatchError: t("passwordMatchError"),
  tPasswordIsReset: t("passwordIsReset"),

  validation_errors: [],

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
