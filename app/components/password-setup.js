import Ember from 'ember';
import ENV from 'irene/config/environment';

const PasswordSetupComponent = Ember.Component.extend({

  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  uuid: "",
  token: "",
  password: "",
  confirmPassword: "",

  validation_errors: [],
  isSettingPassword: false,

  validate() {
    this.validation_errors = [];
    const password = this.get("password");

    if (password.length < 6) {
      this.validation_errors.push("Password length must be greater than or equal to 6");
      return this.validation_errors;
    }
    const confirmPassword = this.get("confirmPassword");
    if (password !== confirmPassword) {
      this.validation_errors.push("Passwords doesn't match");
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
        this.get("notify").success("Password is successfully set");
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
