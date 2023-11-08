import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';
import ENUMS from 'irene/enums';

import SubmissionModel from 'irene/models/submission';
import ProjectService from 'irene/services/project';

interface SubmissionListDetailsSignature {
  Args: {
    submission: SubmissionModel;
  };
}

export default class SubmissionListDetailsComponent extends Component<SubmissionListDetailsSignature> {
  @service declare router: RouterService;
  @service('project') declare projectService: ProjectService;

  willDestroy() {
    super.willDestroy();

    // on completion submission is removed
    this.refreshProjectList();
  }

  get messageClass() {
    const status = this.args.submission.status;

    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED:
        return 'is-danger';
      case ENUMS.SUBMISSION_STATUS.ANALYZING:
        return 'is-success';
      default:
        return 'is-progress';
    }
  }

  @action
  refreshProjectList() {
    const submissionCompleted =
      this.args.submission.status === ENUMS.SUBMISSION_STATUS.ANALYZING;

    const isProjectsRoute =
      this.router.currentRouteName === 'authenticated.projects';

    const hasDefaultFilters = this.projectService.isProjectReponseFiltered;

    // check for submission completed & projects route & is in default state
    if (submissionCompleted && isProjectsRoute && !hasDefaultFilters) {
      // this will update project list
      this.projectService.fetchProjects.perform();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SubmissionList::Details': typeof SubmissionListDetailsComponent;
  }
}
