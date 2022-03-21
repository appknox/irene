/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { t } from 'ember-intl';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import {
  validatePresence,
  validateConfirmation
} from 'ember-changeset-validations/validators';

const ChangeValidator = {
  old_password: [
    validatePresence(true)
  ],
  password: [
    validatePresence(true)
  ],
  confirm_password: validateConfirmation({ on: 'password' }),
};


const PasswordChangeComponent = Component.extend({
  intl: service(),
  ajax: service(),
  router: service(),
  notify: service('notifications'),
  tEnterValidPassword: t("enterValidPassword"),
  tInvalidPassword: t("invalidPassword"),
  tPasswordChanged: t("passwordChanged"),
  tSomethingWentWrong: t("tSomethingWentWrong"),
  changePasswordURL: ENV.endpoints.changePassword,
  model: {},
  init() {
    this._super(...arguments);
    const model = this.get('model');
    const changeset = new Changeset(
      model, lookupValidator(ChangeValidator), ChangeValidator
    );
    this.set('changeset', changeset);
  },
  changePassword: task(function*(){
    const changeset = this.get('changeset');
    yield changeset.validate();
    if(!changeset.get('isValid')) {
      return;
    }
    const old_password = changeset.get('old_password');
    const password = changeset.get('password');
    const confirm_password = changeset.get('confirm_password');
    const url = this.get('changePasswordURL');
    try {
      yield this.get("ajax").post(url, {
        data: {
          old_password: old_password,
          password: password,
          confirm_password: confirm_password
        }
      })
      triggerAnalytics('feature',ENV.csb.changePassword);
      this.get('router').transitionTo("login");
      this.get("notify").success(this.get("tPasswordChanged"));
    } catch(errors) {
      if(errors.payload) {
        Object.keys(errors.payload).forEach(key => {
          changeset.addError(key, errors.payload[key]);
        });
        return;
      }
      this.get("notify").error(this.get('tSomethingWentWrong'));
      this.get("logger").error("Change password error", errors);
      throw errors;
    }
  })
});

export default PasswordChangeComponent;
