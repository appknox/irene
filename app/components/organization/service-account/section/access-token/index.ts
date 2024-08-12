import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import { next } from '@ember/runloop';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';

export interface OrganizationServiceAccountSectionAccessTokenSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    renderType?: 'view' | 'create';
  };
}

export default class OrganizationServiceAccountSectionAccessTokenComponent extends Component<OrganizationServiceAccountSectionAccessTokenSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked isEditView = false;
  @tracked expiryInDays = 30;
  @tracked doesNotExpire: boolean;

  constructor(
    owner: unknown,
    args: OrganizationServiceAccountSectionAccessTokenSignature['Args']
  ) {
    super(owner, args);

    this.doesNotExpire = this.args.serviceAccount.expiry === null;

    // sets the expiry in create mode
    next(() => {
      this.setCreateServiceAccountExpiry();
    });
  }

  get renderType() {
    return this.args.renderType || 'view';
  }

  get isEditOrCreateView() {
    return this.isEditView || this.renderType === 'create';
  }

  get showHeaderAction() {
    return this.renderType === 'view' && !this.isEditView;
  }

  get expiresOn() {
    return dayjs(this.args.serviceAccount?.expiry).format('MMM DD, YYYY');
  }

  get expiryInDate() {
    return dayjs().add(this.expiryInDays, 'days').format('MMM DD, YYYY');
  }

  get expiryInNativeDate() {
    return dayjs().add(this.expiryInDays, 'days').toDate();
  }

  get secretAccessKey() {
    return this.serviceAccountService.tempSecretAccessKey;
  }

  get secretAccessKeyVisible() {
    return Boolean(this.secretAccessKey);
  }

  get secretAccessKeyHelperText() {
    return this.secretAccessKeyVisible
      ? this.intl.t('serviceAccountModule.unmaskedSecretAccountKeyHelperText')
      : this.intl.t('serviceAccountModule.maskedSecretAccountKeyHelperText');
  }

  setCreateServiceAccountExpiry() {
    if (this.renderType === 'create') {
      this.args.serviceAccount.expiry = this.doesNotExpire
        ? null
        : this.expiryInNativeDate;
    }
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    // reset to default
    this.expiryInDays = 30;
    this.doesNotExpire = this.args.serviceAccount.expiry === null;
  }

  @action
  handleExpireInDaysChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    const days = parseInt(value.trim());

    this.expiryInDays = Number.isNaN(days) || days <= 1 ? 1 : days;

    // update the expiry in create mode
    this.setCreateServiceAccountExpiry();
  }

  @action
  handleExpireInDaysIncrement() {
    this.expiryInDays = this.expiryInDays + 1;

    // update the expiry in create mode
    this.setCreateServiceAccountExpiry();
  }

  @action
  handleExpireInDaysDecrement() {
    if (this.expiryInDays === 1) {
      return;
    }

    this.expiryInDays = this.expiryInDays - 1;

    // update the expiry in create mode
    this.setCreateServiceAccountExpiry();
  }

  @action
  handleNoExpiryChange(event: Event, checked: boolean) {
    this.doesNotExpire = checked;

    // update the expiry in create mode
    this.setCreateServiceAccountExpiry();
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info(this.intl.t('tokenCopied'));

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error(this.intl.t('pleaseTryAgain'));
  }

  @action
  handleRegenerateKey() {
    this.regenerateKey.perform();
  }

  regenerateKey = task(async () => {
    const serviceAccount = this.args.serviceAccount;

    try {
      this.isEditView = false;

      const res = await waitForPromise(
        serviceAccount.resetKey(
          this.doesNotExpire ? null : this.expiryInNativeDate
        )
      );

      serviceAccount.updateValues(res);

      this.serviceAccountService.tempSecretAccessKey =
        serviceAccount.secretAccessKey;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::AccessToken': typeof OrganizationServiceAccountSectionAccessTokenComponent;
  }
}
