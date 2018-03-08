import Ember from 'ember';
import ENV from 'irene/config/environment';

const PasswordSetupComponent = Ember.Component.extend({

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
      this.set("isSettingPassword", true);
      this.get("ajax").post(ENV.endpoints.setup, {data})
      .then(function(){
        that.set("isSettingPassword", false);
        that.container.lookup("route:setup").transitionTo("login");
        that.get("notify").success("Password is successfully set");
      })
      .catch(function(error) {
        that.set("isSettingPassword", false);
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default PasswordSetupComponent;
