import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';

const PasswordResetComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),

  uuid: "",
  token: "",
  password: "",
  confirmPassword: "",

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
      return;
    }
    const confirmPassword = this.get("confirmPassword");
    if (password !== confirmPassword) {
      this.validation_errors.push(tPasswordMatchError);
    }
    return this.validation_errors;
  },

  actions: {

    reset() {
      const tPasswordIsReset = this.get("tPasswordIsReset");
      const that = this;
      this.validate();
      if (this.validation_errors.length > 0) {
        return that.get("notify").error(`${this.validation_errors.join(" & ")}`);
      }
      const password = this.get("password");
      const uuid = this.get("uuid");
      const token = this.get("token");
      const data = {
        uuid,
        token,
        password
      };
      this.get("ajax").post(ENV.endpoints.reset, {data})
      .then(function(data){
        that.container.lookup("route:reset").transitionTo("login");
        that.get("notify").success(tPasswordIsReset);
      })
      .catch(function(error) {
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default PasswordResetComponent;
