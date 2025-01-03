import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import lookupValidator from 'ember-changeset-validations';
import { BufferedChangeset } from 'ember-changeset/types';
import {
  validatePresence,
  validateConfirmation,
} from 'ember-changeset-validations/validators';
import { Changeset } from 'ember-changeset';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

type ChangesetBufferProps = BufferedChangeset & {
  old_password: string;
  password: string;
  confirm_password: string;
};

const ChangeValidator = {
  old_password: [validatePresence(true)],
  password: [validatePresence(true)],
  confirm_password: validateConfirmation({ on: 'password' }),
};

export default class AccountSettingsSecurityPasswordChangeComponent extends Component {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service('rollbar') declare logger: any;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;

  @tracked changeset: ChangesetBufferProps | null = null;

  changePasswordURL = ENV.endpoints['changePassword'];
  model = {};

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.changeset = Changeset(
      this.model,
      lookupValidator(ChangeValidator),
      ChangeValidator
    ) as ChangesetBufferProps;
  }

  changePassword = task({ drop: true }, async () => {
    await this.changeset?.validate?.();

    if (!this.changeset?.isValid) {
      return;
    }

    const data = {
      old_password: this.changeset.old_password,
      password: this.changeset.password,
      confirm_password: this.changeset.confirm_password,
    };

    try {
      await this.ajax.post(this.changePasswordURL as string, {
        data,
      });

      triggerAnalytics(
        'feature',
        ENV.csb['changePassword'] as CsbAnalyticsFeatureData
      );

      this.router.transitionTo('login');

      this.notify.success(this.intl.t('passwordChanged'));
    } catch (err) {
      const errors = err as AjaxError;

      if (errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          this.changeset?.addError?.(key, errors.payload[key]);
        });

        return;
      }

      this.notify.error(this.intl.t('tSomethingWentWrong'));
      this.logger.error('Change password error', errors);

      throw errors;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::PasswordChange': typeof AccountSettingsSecurityPasswordChangeComponent;
  }
}
