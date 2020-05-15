import Component from "@ember/component";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import ENUMS from "irene/enums";

const SubmissionDetailsComponent = Component.extend({
  billingHelper: service("billing-helper"),

  submission: null,

  showPlanSelectionModal: computed("submission.reason", function () {
    const reason = this.get("submission.reason");
    this.get("billingHelper").set("submissionId", this.get("submission.id"));
    const isPlanNotSelected =
      reason === ENUMS.SUBMISSION_ERROR_REASON.PLAN_SELECTION;
    this.get("billingHelper").set(
      "showUploadPlanSelectionModal",
      isPlanNotSelected
    );
    return isPlanNotSelected;
  }),

  messageClass: computed("submission.status", function () {
    const status = this.get("submission.status");
    switch (status) {
      case ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED:
      case ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED:
        return "is-danger";
      case ENUMS.SUBMISSION_STATUS.ANALYZING:
        return "is-success";
      default:
        return "is-progress";
    }
  }),
});

export default SubmissionDetailsComponent;
