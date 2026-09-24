import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';
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
  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked isEditView = false;
  refreshSelectedProjectList: (() => void) | null = null;

  willDestroy(): void {
    super.willDestroy();

    this.serviceAccountService.pendingProjectSelections = {};
  }

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
    this.serviceAccountService.pendingProjectSelections = {};
  }

  @action
  registerListRefresh(fn: () => void) {
    this.refreshSelectedProjectList = fn;
  }

  @action
  handleProjectAccessSelectChange(selected: { label: string; value: boolean }) {
    this.args.serviceAccount.allProjects = selected.value;
  }

  @action
  handleCliEnabledChange(event: Event, checked: boolean) {
    this.args.serviceAccount.cliEnabled = checked;

    // CLI-enabled accounts cannot have an expiry — see
    // serviceAccountModule.cliEnabledDescription. The access-token section
    // also disables its own inputs based on `cliEnabled`, but this covers a
    // stale expiry set before CLI was enabled.
    if (checked) {
      this.args.serviceAccount.expiry = null;
    }
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  updateServiceAccount = task(async () => {
    // Captured before save() resolves: a successful save immediately clears
    // changedAttributes(), which forceUserToUpdate depends on.
    const hasPendingProjects = this.forceUserToUpdate;

    try {
      await this.args.serviceAccount?.save();

      if (hasPendingProjects) {
        const pendingProjects = Object.values(
          this.serviceAccountService.pendingProjectSelections
        );

        for (const project of pendingProjects) {
          await waitForPromise(
            this.serviceAccountService.addProjectToServiceAccount.perform(
              project,
              this.args.serviceAccount
            )
          );
        }

        this.serviceAccountService.pendingProjectSelections = {};
        this.refreshSelectedProjectList?.();
      }

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
