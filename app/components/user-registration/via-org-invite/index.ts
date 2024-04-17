import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';
import RouterService from '@ember/routing/router-service';

import ENV from 'irene/config/environment';
import InviteRegisterValidation from '../../../validations/invite-register';
import SSOInviteRegisterValidation from '../../../validations/sso-invite-register';
import { ChangesetBufferProps } from '../form';
import IntlService from 'ember-intl/services/intl';

export interface ViaOrgInviteSignature {
  Args: {
    isSSOEnforced: boolean;
    token: string;
    email: string;
    company: string;
  };
  Blocks: {
    default: [];
  };
}

type RegistrationData = {
  username: string;
  terms_accepted: boolean;
  first_name?: string;
  last_name?: string;
  password?: string;
  confirm_password?: string;
};

export default class ViaOrgInviteComponent extends Component<ViaOrgInviteSignature> {
  @service declare ajax: any;
  @service declare router: RouterService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked inviteRegisterPOJO = {};
  @tracked success = false;
  @tracked changeset: ChangesetBufferProps;

  constructor(owner: unknown, args: ViaOrgInviteSignature['Args']) {
    super(owner, args);

    const RegisterValidation = this.args.isSSOEnforced
      ? SSOInviteRegisterValidation
      : InviteRegisterValidation;

    this.changeset = Changeset(
      this.inviteRegisterPOJO,
      lookupValidator(RegisterValidation),
      RegisterValidation,
      { initValidate: true }
    ) as ChangesetBufferProps;
  }

  registerTask = task(async (changeset) => {
    await changeset.validate();

    if (changeset.get('isValid')) {
      const data: RegistrationData = {
        username: changeset.get('username'),
        terms_accepted: changeset.get('termsAccepted'),
      };

      if (!this.args.isSSOEnforced) {
        data['first_name'] = changeset.get('firstname');
        data['last_name'] = changeset.get('lastname');
        data['password'] = changeset.get('password');
        data['confirm_password'] = changeset.get('passwordConfirmation');
      }

      await this.registerWithServer.perform(data);
    }
  });

  registerWithServer = task(async (data) => {
    const token = this.args.token;
    const changeset = this.changeset;
    const url = [ENV.endpoints['invite'], token].join('/');

    try {
      await this.ajax.request(url, {
        method: 'POST',
        data: data,
      });

      this.success = true;
    } catch (err) {
      const errors = err as AjaxError;

      if (errors.payload) {
        Object.keys(errors.payload).forEach((key) => {
          if (changeset.validationMap && key in changeset.validationMap) {
            changeset.addError(key, errors.payload[key]);
          } else {
            this.notify.error(this.intl.t('somethingWentWrong'));
            return;
          }
        });
      }
    }
  });

  @action
  register(changeset: ChangesetBufferProps) {
    this.registerTask.perform(changeset);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::ViaOrgInvite': typeof ViaOrgInviteComponent;
  }
}
