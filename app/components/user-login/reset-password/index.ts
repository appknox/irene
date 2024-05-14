import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import { task } from 'ember-concurrency';

import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import { BufferedChangeset } from 'ember-changeset/types';

import {
  validatePresence,
  validateConfirmation,
} from 'ember-changeset-validations/validators';

import IntlService from 'ember-intl/services/intl';
import RouterService from '@ember/routing/router-service';

interface UserLoginResetPasswordComponentSignature {
  Args: {
    token?: string;
  };
}

type ChangesetBufferProps = BufferedChangeset & {
  password: string;
  confirm_password: string;
};

const ResetValidator = {
  password: [validatePresence(true)],
  confirm_password: validateConfirmation({ on: 'password' }),
};

export default class UserLoginResetPasswordComponent extends Component<UserLoginResetPasswordComponentSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare router: RouterService;
  @service('rollbar') declare logger: any;
  @service('notifications') declare notify: NotificationService;

  @tracked isVerified = false;
  @tracked changeset: ChangesetBufferProps | null = null;

  resetURL = ENV.endpoints['reset'];

  validation_errors = [];
  model = {};

  constructor(
    owner: unknown,
    args: UserLoginResetPasswordComponentSignature['Args']
  ) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(ResetValidator),
      ResetValidator
    ) as ChangesetBufferProps;

    this.verifyToken.perform();
  }

  get token() {
    return this.args.token || '';
  }

  get disableResetButton() {
    if (
      !this.changeset?.password ||
      !this.changeset.confirm_password ||
      this.changeset.error['confirm_password']
    ) {
      return true;
    }

    return false;
  }

  get url() {
    return [this.resetURL, this.token].join('/');
  }

  verifyToken = task(async () => {
    try {
      // check valid token
      await this.ajax.request(this.url);

      this.isVerified = true;
    } catch (error) {
      this.isVerified = false;
    }
  });

  get isNotVerified() {
    return !this.verifyToken.isRunning && !this.isVerified;
  }

  reset = task(async (event: SubmitEvent) => {
    event.preventDefault();

    await this.changeset?.validate?.();

    if (!this.changeset?.isValid) {
      return;
    }

    const password = this.changeset.password;
    const confirm_password = this.changeset.confirm_password;

    try {
      await this.ajax.put(this.url, {
        data: {
          password: password,
          confirm_password: confirm_password,
        },
      });

      this.router.transitionTo('login');

      this.notify.success(this.intl.t('passwordIsReset'));
    } catch (err) {
      const errors = err as AdapterError;

      if (errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          this.changeset?.addError?.(key, errors.payload[key]);
        });

        return;
      }

      this.notify.error(this.intl.t('somethingWentWrong'));

      this.logger.error('Reset password error', errors);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserLogin::ResetPassword': typeof UserLoginResetPasswordComponent;
  }
}
