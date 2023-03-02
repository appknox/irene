import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import SubmissionModel from 'irene/models/submission';

interface SubmissionListDetailsSignature {
  Args: {
    submission: SubmissionModel;
  };
}

export default class SubmissionListDetailsComponent extends Component<SubmissionListDetailsSignature> {
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SubmissionList::Details': typeof SubmissionListDetailsComponent;
  }
}
