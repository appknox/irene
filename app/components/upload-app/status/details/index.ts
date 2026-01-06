import Component from '@glimmer/component';
import { action } from '@ember/object';
import { helper } from '@ember/component/helper';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import ENUMS from 'irene/enums';
import type { SubmissionModelWithSystemFileData } from '../index';
import type ProjectService from 'irene/services/project';
import type UploadAppService from 'irene/services/upload-app';

dayjs.extend(relativeTime);

interface UploadAppStatusDetailsSignature {
  Element: HTMLDivElement;
  Args: {
    submission: SubmissionModelWithSystemFileData;
  };
}

export default class UploadAppStatusDetailsComponent extends Component<UploadAppStatusDetailsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare uploadApp: UploadAppService;
  @service('project') declare projectService: ProjectService;

  normalizeFileProgress = helper(([value]: [number]) => {
    return Math.round(value / 1.25);
  });

  constructor(owner: unknown, args: UploadAppStatusDetailsSignature['Args']) {
    super(owner, args);

    if (this.args.submission.id) {
      this.uploadApp.submissionSet.add(this.args.submission.id);
    }
  }

  get refreshProjectListDependencies() {
    return {
      submissionStatus: () => this.args.submission.status,
    };
  }

  @action
  refreshProjectList() {
    const submissionCompleted =
      this.args.submission.status === ENUMS.SUBMISSION_STATUS.ANALYZING;

    const isProjectsRoute =
      this.router.currentRouteName === 'authenticated.dashboard.projects';

    const hasDefaultFilters = this.projectService.isProjectReponseFiltered;

    if (submissionCompleted && isProjectsRoute && !hasDefaultFilters) {
      this.projectService.fetchProjects.perform();
    }
  }

  get submissionStatus() {
    const status = this.args.submission.status;

    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_URL_VALIDATION_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.STORE_UPLOAD_FAILED:
        return {
          label: this.intl.t('failed'),
          icon: 'error' as const,
          iconColor: 'error' as const,
          running: false,
          failed: true,
        };

      case ENUMS.SUBMISSION_STATUS.ANALYZING:
        return {
          label: this.intl.t('completed'),
          icon: 'download-done' as const,
          iconColor: 'success' as const,
          running: false,
          failed: false,
        };

      default:
        return {
          label: this.intl.t('inProgress'),
          icon: 'downloading' as const,
          iconColor: 'info' as const,
          running: true,
          failed: false,
        };
    }
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
