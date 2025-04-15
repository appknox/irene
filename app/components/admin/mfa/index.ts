import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';

export interface AdminMfaSignature {
  Args: {
    user: UserModel;
    organization: OrganizationModel;
  };
}

export default class AdminMfaComponent extends Component<AdminMfaSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isSavingStatus = false;
  @tracked showAddEditPopup = false;

  tChangedMandatoryMFA: string;
  tPleaseTryAgain: string;

  constructor(owner: unknown, args: AdminMfaSignature['Args']) {
    super(owner, args);

    this.tChangedMandatoryMFA = this.intl.t('changedMandatoryMFA');
    this.tPleaseTryAgain = this.intl.t('pleaseTryAgain');
  }

  get organization() {
    return this.args.organization;
  }

  get isMfaMandateDisabled() {
    return !this.args.user.mfaEnabled || this.isSavingStatus;
  }

  get isUserMfaDisabled() {
    return !this.args.user.mfaEnabled;
  }

  setMandatoryMFA = task(async (_, mandatoryStateChecked) => {
    try {
      this.isSavingStatus = true;

      const org = this.organization;
      org.set('mandatoryMfa', mandatoryStateChecked);

      await org.save();

      this.isSavingStatus = false;
      this.notify.success(this.tChangedMandatoryMFA);
    } catch (err) {
      this.isSavingStatus = false;

      const error = err as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (error.errors?.length) {
        errMsg = error.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::Mfa': typeof AdminMfaComponent;
  }
}
