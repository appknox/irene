import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isValidPassword = password=> password.length > 5;

const PasswordChangeComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  passwordCurrent: "",
  passwordNew: "",
  passwordConfirm: "",
  tEnterValidPassword: t("enterValidPassword"),
  tInvalidPassword: t("invalidPassword"),
  tPasswordChanged: t("passwordChanged"),
  actions: {
    changePassword() {
      const tEnterValidPassword = this.get("tEnterValidPassword");
      const tInvalidPassword = this.get("tInvalidPassword");
      const tPasswordChanged = this.get("tPasswordChanged");
      const passwordCurrent = this.get("passwordCurrent");
      const passwordNew = this.get("passwordNew");
      const passwordConfirm = this.get("passwordConfirm");
      for (let password of [passwordCurrent, passwordNew, passwordConfirm]) {
        if (!isValidPassword(password)) { return this.get("notify").error(tEnterValidPassword); }
      }
      if (passwordNew !== passwordConfirm) {
        return this.get("notify").error(tInvalidPassword);
      }
      const data = {
        password: passwordCurrent,
        newPassword: passwordNew
      };
      const that = this;
      const ajax = this.get("ajax");
      ajax.post(ENV.endpoints.changePassword, {data})
      .then(function() {
        that.setProperties({
          passwordCurrent: "",
          passwordNew: "",
          passwordConfirm: ""
          });
        that.get("notify").success(tPasswordChanged);
        triggerAnalytics('feature',ENV.csb.changePassword);
      })
      .catch(function(error) {
        that.get("notify").error(error.payload.message);
      });
    }
  }
});

export default PasswordChangeComponent;
