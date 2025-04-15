import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import lookupValidator from 'ember-changeset-validations';
import { validatePresence } from 'ember-changeset-validations/validators';
import { Changeset } from 'ember-changeset';
import type { BufferedChangeset } from 'ember-changeset/types';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type ServiceAccountModel from 'irene/models/service-account';

export interface AdminServiceAccountSectionAccountOverviewSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    setChangeset?: (changeset: BufferedChangeset) => ChangesetBufferProps;
    renderType?: 'view' | 'create';
  };
}

type ChangesetBufferProps = BufferedChangeset & {
  name: string;
  description: string;
};

const ChangeValidator = {
  name: [validatePresence(true)],
  description: [validatePresence(true)],
};

export default class AdminServiceAccountSectionAccountOverviewComponent extends Component<AdminServiceAccountSectionAccountOverviewSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditView = false;
  @tracked changeset?: ChangesetBufferProps | null = null;

  constructor(
    owner: unknown,
    args: AdminServiceAccountSectionAccountOverviewSignature['Args']
  ) {
    super(owner, args);

    const changeset = Changeset(
      this.args.serviceAccount,
      lookupValidator(ChangeValidator),
      ChangeValidator
    ) as ChangesetBufferProps;

    this.changeset = this.isCreateView
      ? this.args.setChangeset?.(changeset)
      : changeset;
  }

  get renderType() {
    return this.args.renderType || 'view';
  }

  get isEditOrCreateView() {
    return this.isEditView || this.renderType === 'create';
  }

  get isCreateView() {
    return this.renderType === 'create';
  }

  get showHeaderAction() {
    return this.renderType === 'view' && !this.isEditView;
  }

  @action
  hasInputError(key: string) {
    return Boolean(this.changeset?.error[key]);
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    this.changeset?.rollback();
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    await this.changeset?.validate();

    if (this.changeset?.isInvalid) {
      return;
    }

    try {
      await this.changeset?.save();

      this.isEditView = false;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Admin::ServiceAccount::Section::AccountOverview': typeof AdminServiceAccountSectionAccountOverviewComponent;
  }
}
