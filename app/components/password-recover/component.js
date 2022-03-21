/* eslint-disable ember/no-classic-components, prettier/prettier, ember/no-classic-classes, ember/require-tagless-components, ember/avoid-leaking-state-in-ember-objects, ember/no-get */
import { task } from 'ember-concurrency';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import {
  validatePresence
} from 'ember-changeset-validations/validators';
import { t } from 'ember-intl';

const ResetValidator = {
  username: [
    validatePresence(true)
  ]
};

const PasswordRecoverComponent = Component.extend({
  recoverURL: ENV.endpoints.recover,

  ajax: service(),
  notify: service('notifications'),
  tSomethingWentWrong: t("somethingWentWrong"),
  logger: service('rollbar'),

  mailSent: false,
  model: {},

  init() {
    this._super(...arguments);
    const model = this.get('model');
    const changeset = new Changeset(
      model, lookupValidator(ResetValidator), ResetValidator
    );
    this.set('changeset', changeset);
  },

  recover: task(function*(){
    const changeset = this.get('changeset');
    yield changeset.validate();
    if(!changeset.get('isValid')) {
      return;
    }
    const username = changeset.get('username');
    try {
      yield this.get("ajax").post(this.get('recoverURL'), {
        data: {
          username: username
        }
      })
      this.set('mailSent', true);
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

export default PasswordRecoverComponent;
