/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import ENUMS from 'irene/enums';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const SubmissionDetailsComponent = Ember.Component.extend({
  submission: null,

  messageClass: (function() {
    const status = this.get("submission.status");
    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:  case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED: return "is-danger";
      case ENUMS.SUBMISSION_STATUS.ANALYZING: return "is-success";
      default: return "is-progress";
    }
  }).property("submission.status"),

  statusObserver: Ember.observer("submission.status", function() {
    const status = this.get("submission.status");
    if (status === ENUMS.SUBMISSION_STATUS.ANALYZING) {
      return triggerAnalytics('feature',ENV.csb.applicationUpload);
    }
  })
});


export default SubmissionDetailsComponent;
