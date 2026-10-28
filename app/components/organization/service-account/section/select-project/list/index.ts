import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type ProjectModel from 'irene/models/project';
import type ServiceAccountProjectModel from 'irene/models/service-account-project';
import type ServiceAccountModel from 'irene/models/service-account';
import parseError from 'irene/utils/parse-error';

export interface OrganizationServiceAccountSectionSelectProjectListSignature {
  Args: {
    serviceAccount: ServiceAccountModel;
    projects: Array<ServiceAccountProjectModel | ProjectModel>;
    totalCount: number;
    isLoading: boolean;
    limit: number;
    offset: number;
    isEditView: boolean;
    isCreateView: boolean;
    isPendingSave: boolean;
    onNextPrev: (args: { limit: number; offset: number }) => void;
    onItemPerPageChange: (args: { limit: number }) => void;
    onRefresh: () => void;
  };
}

const DEFAULT_LIMIT = 5;

export default class OrganizationServiceAccountSectionSelectProjectListComponent extends Component<OrganizationServiceAccountSectionSelectProjectListSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked serviceAccountProjectToDelete: ServiceAccountProjectModel | null =
    null;

  @tracked openAddProjectDrawer = false;

  get hasNoproject() {
    return this.args.totalCount === 0;
  }

  get showPagination() {
    return this.args.totalCount > DEFAULT_LIMIT;
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

        this.args.onRefresh();

        closeHandler();
      } catch (error) {
        this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectProject::List': typeof OrganizationServiceAccountSectionSelectProjectListComponent;
  }
}
