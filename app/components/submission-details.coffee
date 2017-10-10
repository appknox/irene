`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import ENV from 'irene/config/environment';`

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

  statusObserver: Ember.observer "submission.status", ->
    status = @get "submission.status"
    if status is ENUMS.SUBMISSION_STATUS.ANALYZING
      analytics.feature(ENV.csb.feature.applicationUpload, ENV.csb.module.security, ENV.csb.product.appknox)


`export default SubmissionDetailsComponent`
