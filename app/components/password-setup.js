/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENV from 'irene/config/environment';

const PasswordSetupComponent = Ember.Component.extend({

  uuid: "",
  token: "",
  password: "",
  confirmPassword: "",

  validation_errors: [],

  validate() {
    this.validation_errors = [];
    const password = this.get("password");

    if (password.length < 6) {
      this.validation_errors.push("Password length must be greater than or equal to 6");
      return;
    }
    const confirmPassword = this.get("confirmPassword");
    if (password !== confirmPassword) {
      this.validation_errors.push("Passwords doesn't match");
    }
    return this.validation_errors;
  },

  actions: {

    setup() {
      this.validate();
      const that = this;
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
      return this.get("ajax").post(ENV.endpoints.setup, {data})
      .then(function(data){
        that.container.lookup("route:setup").transitionTo("login");
        return that.get("notify").success("Password is successfully set");}).catch(error =>
        (() => {
          const result = [];
          for (error of Array.from(error.errors)) {
            result.push(that.get("notify").error(error.detail != null ? error.detail.message : undefined));
          }
          return result;
        })()
      );
    }
  }
});

export default PasswordSetupComponent;
