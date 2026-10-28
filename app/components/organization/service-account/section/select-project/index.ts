import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type ServiceAccountProjectModel from 'irene/models/service-account-project';
import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectProjectSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    renderType?: 'view' | 'create';
  };
}

type ServiceAccountProjectResponse =
  DS.AdapterPopulatedRecordArray<ServiceAccountProjectModel> & {
    meta?: { count: number };
  };

const DEFAULT_LIMIT = 5;

export default class OrganizationServiceAccountSectionSelectProjectComponent extends Component<OrganizationServiceAccountSectionSelectProjectSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;
  @service('service-account')
  declare serviceAccountService: ServiceAccountService;

  @tracked isEditView = false;
  @tracked limit = DEFAULT_LIMIT;
  @tracked offset = 0;
  @tracked serviceAccountProjectResponse?: ServiceAccountProjectResponse;

  constructor(
    owner: unknown,
    args: OrganizationServiceAccountSectionSelectProjectSignature['Args']
  ) {
    super(owner, args);

    // Not gated on isStaged: right after creating an account the previous
    // (create) page may not have cleared its staged projects yet.
    if (!this.args.serviceAccount.allProjects && !this.isCreateView) {
      this.fetchSelectedProjects.perform(this.limit, this.offset);
    }
  }

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

  get isPendingSave() {
    return !!this.forceUserToUpdate || this.hasPendingSelections;
  }

  get hasPendingSelections() {
    return (
      Object.keys(this.serviceAccountService.pendingProjectSelections).length >
      0
    );
  }

  // Projects are staged locally (not yet persisted) while creating, while
  // switching from "All Projects", and after a save left some of them failing.
  get isStaged() {
    return (
      this.isCreateView || !!this.forceUserToUpdate || this.hasPendingSelections
    );
  }

  get selectedProjectList() {
    return this.isStaged
      ? Object.values(
          this.serviceAccountService.pendingProjectSelections
        ).slice(this.offset, this.offset + this.limit)
      : this.serviceAccountProjectResponse?.slice() || [];
  }

  get totalSelectedProjectCount() {
    return this.isStaged
      ? Object.keys(this.serviceAccountService.pendingProjectSelections).length
      : this.serviceAccountProjectResponse?.meta?.count || 0;
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
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.loadSelectedProjects();
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.loadSelectedProjects();
  }

  @action
  handleSelectedProjectsRefresh() {
    this.fetchSelectedProjects.perform(this.limit, this.offset);
  }

  @action
  handleProjectAccessSelectChange(selected: { label: string; value: boolean }) {
    this.args.serviceAccount.allProjects = selected.value;

    // list wasn't mounted (or fetched) while "All Projects" was selected
    if (!selected.value && !this.isStaged) {
      this.loadSelectedProjects();
    }
  }

  // staged projects are paginated locally, only persisted ones need a fetch
  loadSelectedProjects() {
    if (!this.isStaged) {
      this.handleSelectedProjectsRefresh();
    }
  }

  @action
  handleUpdateServiceAccount() {
    this.updateServiceAccount.perform();
  }

  /**
   * Persists the staged projects one by one, keeping only the failed ones
   * staged so that a retry from the Update button picks up where it left off.
   */
  async persistPendingProjects() {
    const pending = this.serviceAccountService.pendingProjectSelections;
    const failed: Record<string, ProjectModel> = {};

    for (const [id, project] of Object.entries(pending)) {
      const hasErrored = await waitForPromise(
        this.serviceAccountService.addProjectToServiceAccount.perform(
          project,
          this.args.serviceAccount
        )
      );

      if (hasErrored) {
        failed[id] = project;
      }
    }

    this.serviceAccountService.pendingProjectSelections = failed;

    return Object.keys(failed).length;
  }

  updateServiceAccount = task(async () => {
    try {
      await this.args.serviceAccount?.save();

      // Checked after save(): a successful save clears changedAttributes(),
      // so staged projects (also left over from a failed attempt) are the
      // source of truth for whether there is something left to persist.
      if (this.hasPendingSelections) {
        const failedCount = await this.persistPendingProjects();

        if (failedCount > 0) {
          this.notify.error(
            this.intl.t('serviceAccountModule.addProjectsFailedMsg', {
              count: failedCount,
            })
          );

          return;
        }

        this.handleSelectedProjectsRefresh();
      }

      this.isEditView = false;

      this.notify.success(this.intl.t('serviceAccountModule.editSuccessMsg'));
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
    }
  });

  fetchSelectedProjects = task(async (limit: number, offset: number) => {
    try {
      this.serviceAccountProjectResponse = (await this.store.query(
        'service-account-project',
        {
          limit,
          offset,
          serviceAccountId: this.args.serviceAccount.id,
        }
      )) as ServiceAccountProjectResponse;
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
