import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import lookupValidator from 'ember-changeset-validations';
import { BufferedChangeset } from 'ember-changeset/types';
import {
  validatePresence,
  validateConfirmation,
} from 'ember-changeset-validations/validators';
import { Changeset } from 'ember-changeset';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';
import type AnalyticsService from 'irene/services/analytics';

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
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare analytics: AnalyticsService;

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

      this.analytics.track({
        name: 'PASSWORD_CHANGE_EVENT',
        properties: {
          feature: 'change_password',
        },
      });

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

      this.analytics.trackError(err, {
        screen: 'password_change',
        feature: 'change_password_flow',
      });

      throw errors;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::Security::PasswordChange': typeof AccountSettingsSecurityPasswordChangeComponent;
  }
}
