import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { debounceTask } from 'ember-lifeline';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type ServiceAccountProjectModel from 'irene/models/service-account-project';
import type ServiceAccountModel from 'irene/models/service-account';
import type ServiceAccountService from 'irene/services/service-account';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectProjectListSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    isEditView: boolean;
    isCreateView: boolean;
  };
}

type ServiceAccountProjectResponse =
  DS.AdapterPopulatedRecordArray<ServiceAccountProjectModel> & {
    meta?: { count: number };
  };

const DEFAULT_LIMIT = 5;

export default class OrganizationServiceAccountSectionSelectProjectListComponent extends Component<OrganizationServiceAccountSectionSelectProjectListSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare serviceAccount: ServiceAccountService;
  @service('notifications') declare notify: NotificationService;

  @tracked serviceAccountProjectResponse?: ServiceAccountProjectResponse;

  @tracked serviceAccountProjectToDelete: ServiceAccountProjectModel | null =
    null;

  @tracked limit = DEFAULT_LIMIT;
  @tracked offset = 0;
  @tracked searchQuery = '';
  @tracked openAddProjectDrawer = false;

  constructor(
    owner: unknown,
    args: OrganizationServiceAccountSectionSelectProjectListSignature['Args']
  ) {
    super(owner, args);

    this.fetchSelectedProjects.perform(this.limit, this.offset);
  }

  get selectedProjectList() {
    return this.args.isCreateView
      ? Object.values(this.serviceAccount.selectedProjectsForCreate).slice(
          this.offset,
          this.offset + this.limit
        )
      : this.serviceAccountProjectResponse?.slice() || [];
  }

  get totalSelectedProjectCount() {
    return this.args.isCreateView
      ? Object.keys(this.serviceAccount.selectedProjectsForCreate).length
      : this.serviceAccountProjectResponse?.meta?.count || 0;
  }

  get hasNoproject() {
    return this.totalSelectedProjectCount === 0;
  }

  get showPagination() {
    return this.totalSelectedProjectCount > DEFAULT_LIMIT;
  }

  get showRemoveProjectConfirm() {
    return this.serviceAccountProjectToDelete !== null;
  }

  @action
  handleOpenAddProjectDrawer() {
    this.openAddProjectDrawer = true;
  }

  @action
  handleCloseAddProjectDrawer() {
    this.openAddProjectDrawer = false;
  }

  @action
  handleNextPrevAction({ limit, offset }: { limit: number; offset: number }) {
    this.limit = limit;
    this.offset = offset;

    this.fetchSelectedProjects.perform(limit, offset, this.searchQuery);
  }

  @action
  handleItemPerPageChange({ limit }: { limit: number }) {
    this.limit = limit;
    this.offset = 0;

    this.fetchSelectedProjects.perform(limit, 0, this.searchQuery);
  }

  /* Set debounced searchQuery */
  setSearchQuery(query: string) {
    this.searchQuery = query;

    this.fetchSelectedProjects.perform(this.limit, 0, query);
  }

  @action
  handleSearchQueryChange(event: Event) {
    debounceTask(
      this,
      'setSearchQuery',
      (event.target as HTMLInputElement).value,
      500
    );
  }

  @action
  handleSelectedProjectsRefresh() {
    this.fetchSelectedProjects.perform(
      this.limit,
      this.offset,
      this.searchQuery
    );
  }

  @action
  setServiceAccountProjectToDelete(
    serviceAccountProject: ServiceAccountProjectModel
  ) {
    this.serviceAccountProjectToDelete = serviceAccountProject;
  }

  @action
  handleRemoveProjectConfirmClose() {
    this.serviceAccountProjectToDelete = null;
  }

  @action
  handleRemoveProjectConfirmAction(closeHandler: () => void) {
    this.removeServiceAccountProject.perform(
      this.serviceAccountProjectToDelete as ServiceAccountProjectModel,
      closeHandler
    );
  }

  removeServiceAccountProject = task(
    async (
      serviceAccountProject: ServiceAccountProjectModel,
      closeHandler: () => void
    ) => {
      try {
        await serviceAccountProject.destroyRecord();

        this.notify.success(
          this.intl.t('serviceAccountModule.removeProjectSuccessMsg')
        );

        this.handleSelectedProjectsRefresh();

        closeHandler();
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );

  fetchSelectedProjects = task(
    async (limit: number, offset: number, query = '') => {
      if (!this.args.isCreateView) {
        try {
          this.serviceAccountProjectResponse = (await this.store.query(
            'service-account-project',
            {
              limit,
              offset,
              q: query,
              serviceAccountId: this.args.serviceAccount.id,
            }
          )) as ServiceAccountProjectResponse;
        } catch (error) {
          this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
        }
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectProject::List': typeof OrganizationServiceAccountSectionSelectProjectListComponent;
  }
}
