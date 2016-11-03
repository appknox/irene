`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

SubmissionDetailsComponent = Ember.Component.extend
  submission: null
  classNames: ["message"]

  messageClass: (->
    status = @get "submission.status"
    switch status
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED then "is-danger"
      when ENUMS.SUBMISSION_STATUS.ANALYZING then "is-success"
      else "is-progress"
  ).property "submission.status"


`export default SubmissionDetailsComponent`
