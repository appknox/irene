import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const isValidPassword = password=> password.length > 5;

const PasswordChangeComponent = Component.extend({
  intl: service(),
  ajax: service(),
  notify: service('notification-messages-service'),
  passwordCurrent: "",
  passwordNew: "",
  passwordConfirm: "",
  isChangingPassword: false,
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
      this.set("isChangingPassword", true);
      const ajax = this.get("ajax");
      ajax.post(ENV.endpoints.changePassword, {data})
      .then(() => {
        this.get("notify").success(tPasswordChanged);
        triggerAnalytics('feature',ENV.csb.changePassword);
        if(!this.isDestroyed) {
          this.set("isChangingPassword", false);
          this.setProperties({
            passwordCurrent: "",
            passwordNew: "",
            passwordConfirm: ""
            });
          setTimeout(() => window.location.href = "/", 1 * 1000);
        }
      }, (error) => {
        this.set("isChangingPassword", false);
        this.get("notify").error(error.payload.message);
      });
    }
  }
});

export default PasswordChangeComponent;
