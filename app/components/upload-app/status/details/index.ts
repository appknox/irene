/* eslint-disable ember/no-observers */
import Component from '@glimmer/component';
import ENUMS from 'irene/enums';
import dayjs from 'dayjs';
import SubmissionModel from 'irene/models/submission';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { addObserver, removeObserver } from '@ember/object/observers';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { helper } from '@ember/component/helper';

import ProjectService from 'irene/services/project';

type SubmissionModelWithSystemFileData = SubmissionModel & {
  file: {
    progress: number;
  };
};

interface UploadAppStatusDetailsSignature {
  Element: HTMLDivElement;
  Args: {
    submission: SubmissionModelWithSystemFileData;
    submissionSet: Set<string>;
  };
}

export default class UploadAppStatusDetailsComponent extends Component<UploadAppStatusDetailsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service('project') declare projectService: ProjectService;

  normalizeFileProgress = helper(([value]: [number]) => {
    return Math.round(value / 1.25);
  });

  constructor(owner: unknown, args: UploadAppStatusDetailsSignature['Args']) {
    super(owner, args);

    if (this.args.submission.id) {
      this.args.submissionSet.add(this.args.submission.id);
    }

    addObserver(this.args.submission, 'status', this, this.refreshProjectList);
  }

  willDestroy() {
    super.willDestroy();

    this.removeSubmissionStatusObserver();
  }

  @action removeSubmissionStatusObserver() {
    removeObserver(
      this.args.submission,
      'status',
      this,
      this.refreshProjectList
    );
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

  get submissionStatus() {
    return this.args.submission.submissionStatus;
  }

  get createdOn() {
    return dayjs(this.args.submission.createdOn).fromNow();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'UploadApp::Status::Details': typeof UploadAppStatusDetailsComponent;
  }
}
