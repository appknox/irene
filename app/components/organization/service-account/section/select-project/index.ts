import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectProjectSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    renderType?: 'view' | 'create';
  };
}

export default class OrganizationServiceAccountSectionSelectProjectComponent extends Component<OrganizationServiceAccountSectionSelectProjectSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked isEditView = false;

  get renderType() {
    return this.args.renderType || 'view';
  }

  get isCreateView() {
    return this.renderType === 'create';
  }

  get isEditOrCreateView() {
    return this.isEditView || this.isCreateView;
  }

  get showHeaderAction() {
    return this.renderType === 'view' && !this.isEditView;
  }

  get projectAccessOptions() {
    return [
      { label: this.intl.t('allProjects'), value: true },
      {
        label: this.intl.t('serviceAccountModule.forSpecificProjects'),
        value: false,
      },
    ];
  }

  get selectedProjectAccessOption() {
    const { allProjects } = this.args.serviceAccount;

    return this.projectAccessOptions.find((opt) => opt.value === allProjects);
  }

  get forceUserToUpdate() {
    const changedAttributes = this.args.serviceAccount.changedAttributes();
    const isOldValueAllProjects = changedAttributes?.['allProjects']?.[0];

    return this.isEditView && isOldValueAllProjects;
  }

  @action
  handleShowEditView() {
    this.isEditView = true;
  }

  @action
  handleCancelEditView() {
    this.isEditView = false;

    this.args.serviceAccount.rollbackAttributes();
  }

  @action
  handleProjectAccessSelectChange(selected: { label: string; value: boolean }) {
    this.args.serviceAccount.allProjects = selected.value;
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount?.save();

      this.isEditView = false;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectProject': typeof OrganizationServiceAccountSectionSelectProjectComponent;
  }
}
