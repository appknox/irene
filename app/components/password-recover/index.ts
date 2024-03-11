import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import lookupValidator from 'ember-changeset-validations';
import { validatePresence } from 'ember-changeset-validations/validators';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import { Changeset } from 'ember-changeset';
import { Owner } from '@ember/test-helpers/build-owner';
import { BufferedChangeset } from 'ember-changeset/types';

import ENV from 'irene/config/environment';
import LoggerService from 'irene/services/logger';

const ResetValidator = {
  username: [validatePresence(true)],
};

type ChangesetBufferProps = BufferedChangeset & {
  username: string;
};

export default class PasswordRecoverComponent extends Component {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service('rollbar') declare logger: LoggerService;
  @service declare intl: IntlService;

  @tracked mailSent = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  recoverURL = ENV.endpoints['recover'];

  model = {};

  constructor(owner: Owner, args: object) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(ResetValidator),
      ResetValidator
    ) as ChangesetBufferProps;
  }

  get tSomethingWentWrong() {
    return this.intl.t('somethingWentWrong');
  }

  recover = task(async (event: SubmitEvent) => {
    event.preventDefault();

    const changeset = this.changeset;

    await changeset?.validate();

    if (!changeset?.get('isValid')) {
      return;
    }

    const username = changeset.get('username');

    try {
      await this.ajax.post(this.recoverURL, {
        data: {
          username: username,
        },
      });

      this.mailSent = true;
    } catch (err) {
      const errors = err as AjaxError;

      if (errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          changeset.addError(key, errors.payload[key]);
        });

        return;
      }

      this.notify.error(this.tSomethingWentWrong);
      this.logger.error('Reset password error', errors);
    }
  });
}
