import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n'

const PasswordSetupComponent = Component.extend({

  i18n: service(),
  ajax: service(),
  notify: service('notification-messages-service'),

  uuid: "",
  token: "",
  password: "",
  confirmPassword: "",
  tInvalidPassword: t("invalidPassword"),
  tPasswordLengthError:t("passwordLengthError"),
  tPasswordIsSet:t("passwordIsSet"),

  validation_errors: [],
  isSettingPassword: false,

  validate() {
    this.validation_errors = [];
    const password = this.get("password");

    if (password.length < 6) {
      this.validation_errors.push(this.get("tPasswordLengthError"));
      return this.validation_errors;
    }
    const confirmPassword = this.get("confirmPassword");
    if (password !== confirmPassword) {
      this.validation_errors.push(this.get('tInvalidPassword'));
      return this.validation_errors;
    }
  },

  actions: {

    setup() {
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
      this.set("isSettingPassword", true);
      this.get("ajax").post(ENV.endpoints.setup, {data})
      .then(() => {
        if(!this.isDestroyed) {
          this.set("isSettingPassword", false);
          this.container.lookup("route:setup").transitionTo("login");
        }
        this.get("notify").success(this.get('tPasswordIsSet'));
      }, (error) => {
        if(!this.isDestroyed) {
          this.set("isSettingPassword", false);
          this.get("notify").error(error.payload.message);
        }
      });
    }
  }
});

export default PasswordSetupComponent;
