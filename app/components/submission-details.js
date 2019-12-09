import Component from '@ember/component';
import { computed } from '@ember/object';
import { observer } from '@ember/object';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const SubmissionDetailsComponent = Component.extend({
  submission: null,

  messageClass: computed("submission.status", function() {
    const status = this.get("submission.status");
    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:  case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED: return "is-danger";
      case ENUMS.SUBMISSION_STATUS.ANALYZING: return "is-success";
      default: return "is-progress";
    }
  }),

  statusObserver: observer("submission.status", function() {
    const status = this.get("submission.status");
    if (status === ENUMS.SUBMISSION_STATUS.ANALYZING) {
      triggerAnalytics('feature',ENV.csb.applicationUpload);
      triggerAnalytics('feature', ENV.csb.runStaticScan);
    }
  })
});


export default SubmissionDetailsComponent;
