/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get */
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
  notify: service('notifications'),
  token: "",
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
  isVerified: promise.object(computed('token', 'verify_token', function(){
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
  })
});

export default PasswordResetComponent;
