/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get */
import Component from '@ember/component';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';

const SubmissionDetailsComponent = Component.extend({
  submission: null,

  messageClass: computed("submission.status", function() {
    const status = this.get("submission.status");
    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:  case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED: return "is-danger";
      case ENUMS.SUBMISSION_STATUS.ANALYZING: return "is-success";
      default: return "is-progress";
    }
  })
});


export default SubmissionDetailsComponent;
