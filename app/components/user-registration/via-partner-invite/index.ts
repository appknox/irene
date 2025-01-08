import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import lookupValidator from 'ember-changeset-validations';
import { Changeset } from 'ember-changeset';

import ENV from 'irene/config/environment';
import InviteOnlyRegisterValidation from '../../../validations/register-invite';
import LoggerService from 'irene/services/logger';
import { ChangesetBufferProps } from '../form';
import IntlService from 'ember-intl/services/intl';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

interface ViaPartnerInviteSignature {
  Args: {
    token: string;
  };
  Blocks: {
    default: [];
  };
}

interface RegistrationData {
  email: string;
  company: string;
  first_name?: string;
  last_name?: string;
  password: string;
  passwordConfirmation: string;
  termsAccepted: boolean;
}

export default class ViaPartnerInviteComponent extends Component<ViaPartnerInviteSignature> {
  @service declare session: any;
  @service declare ajax: IreneAjaxService;
  @service declare logger: LoggerService;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked toBeSubmittedData = {};
  @tracked initialData: { email?: string; company?: string } = {};
  @tracked changeset: ChangesetBufferProps;
  @tracked invalid = false;

  inviteEndpoint = 'registration-via-invite';

  constructor(owner: unknown, args: ViaPartnerInviteSignature['Args']) {
    super(owner, args);

    this.fetchdata();

    this.changeset = Changeset(
      this.toBeSubmittedData,
      lookupValidator(InviteOnlyRegisterValidation),
      InviteOnlyRegisterValidation,
      { initValidate: true }
    ) as ChangesetBufferProps;
  }

  loadTokenData = task(async () => {
    const url = this.inviteEndpoint + '?token=' + this.args.token;

    try {
      const data = await this.ajax.request<RegistrationData>(url, {
        namespace: ENV.namespace_v2,
      });

      this.initialData = data;

      if (this.changeset) {
        this.changeset.set('company', data.company);
        this.changeset.set('firstname', data.first_name);
        this.changeset.set('lastname', data.last_name);
      }

      return data;
    } catch (error) {
      this.logger.warn(error);

      this.invalid = true;
    }
  });

  registerWithServer = task(async (data) => {
    const url = this.inviteEndpoint;

    try {
      const logininfo = await this.ajax.post<RegistrationData>(url, {
        data: data,
        namespace: ENV.namespace_v2,
      });

      this.authenticate(logininfo);
    } catch (err) {
      const changeset = this.changeset;
      const errors = err as AjaxError;

      Object.keys(errors.payload).forEach((key) => {
        if (changeset.validationMap && key in changeset.validationMap) {
          changeset.addError(key, errors.payload[key]);
        } else {
          this.notify.error(this.intl.t('somethingWentWrong'));
          return;
        }
      });
    }
  });

  registerTask = task(async (changeset) => {
    await changeset.validate();

    if (changeset.get('isValid')) {
      await this.registerWithServer.perform({
        token: this.args.token,
        username: changeset.get('username'),
        password: changeset.get('password'),
        confirm_password: changeset.get('passwordConfirmation'),
        company: changeset.get('company'),
        first_name: changeset.get('firstname'),
        last_name: changeset.get('lastname'),
        terms_accepted: changeset.get('termsAccepted'),
      });
    }
  });

  authenticate(data: RegistrationData) {
    this.session.authenticate('authenticator:login', data);
  }

  @action
  fetchdata() {
    this.loadTokenData.perform();
  }

  @action
  register(changeset: ChangesetBufferProps) {
    this.registerTask.perform(changeset);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UserRegistration::ViaPartnerInvite': typeof ViaPartnerInviteComponent;
  }
}
