import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import type ProjectModel from 'irene/models/project';
import type ServiceAccountProjectModel from 'irene/models/service-account-project';
import type ServiceAccountService from 'irene/services/service-account';

export interface OrganizationServiceAccountSectionSelectProjectListOverviewSignature {
  Args: {
    model: ServiceAccountProjectModel | ProjectModel;
    isEditView: boolean;
    isCreateView: boolean;
    isPendingSave: boolean;
    setServiceAccountProjectToDelete: (
      model: ServiceAccountProjectModel
    ) => void;
  };
}

export default class OrganizationServiceAccountSectionSelectProjectListOverviewComponent extends Component<OrganizationServiceAccountSectionSelectProjectListOverviewSignature> {
  @service declare serviceAccount: ServiceAccountService;

  @tracked showRemoveConfirm = false;

  get isStaged() {
    return this.args.isCreateView || this.args.isPendingSave;
  }

  get platformIcon() {
    return this.isStaged
      ? (this.args.model as ProjectModel).platformIconClass
      : (this.args.model as ServiceAccountProjectModel)
          .get('project')
          .get('platformIconClass');
  }

  get packageName() {
    return this.isStaged
      ? (this.args.model as ProjectModel).packageName
      : (this.args.model as ServiceAccountProjectModel)
          .get('project')
          .get('packageName');
  }

  @action
  handleRemoveClick() {
    if (this.isStaged) {
      const project = this.args.model as ProjectModel;

      const selectedProjects = {
        ...this.serviceAccount.pendingProjectSelections,
      };

      delete selectedProjects[project.id];

      this.serviceAccount.pendingProjectSelections = selectedProjects;
    } else {
      this.args.setServiceAccountProjectToDelete(
        this.args.model as ServiceAccountProjectModel
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::ServiceAccount::Section::SelectProject::List::Overview': typeof OrganizationServiceAccountSectionSelectProjectListOverviewComponent;
  }
}
