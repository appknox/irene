import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import lookupValidator from 'ember-changeset-validations';
import Changeset from 'ember-changeset';
import { validatePresence } from 'ember-changeset-validations/validators';
import { t } from 'ember-intl';
import { tracked } from '@glimmer/tracking';

const ResetValidator = {
  username: [validatePresence(true)],
};

export default class PasswordRecoverComponent extends Component {
  @service ajax;
  @service('notifications') notify;
  @service('rollbar') logger;

  @tracked mailSent = false;

  recoverURL = ENV.endpoints.recover;
  tSomethingWentWrong = t('somethingWentWrong');
  model = {};

  constructor(...args) {
    super(...args);

    const model = this.model;

    this.changeset = new Changeset(
      model,
      lookupValidator(ResetValidator),
      ResetValidator
    );
  }

  @task(function* () {
    const changeset = this.changeset;

    yield changeset.validate();

    if (!changeset.get('isValid')) {
      return;
    }

    const username = changeset.get('username');

    try {
      yield this.ajax.post(this.recoverURL, {
        data: {
          username: username,
        },
      });

      this.mailSent = true;
    } catch (errors) {
      if (errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          changeset.addError(key, errors.payload[key]);
        });

        return;
      }

      this.notify.error(this.tSomethingWentWrong);
      this.logger.error('Reset password error', errors);
    }
  })
  recover;
}
