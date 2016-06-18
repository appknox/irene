`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model';`
`import ENUMS from 'irene/enums';`

NO_OP = [
  ENUMS.SUBMISSION_STATUS.ANALYSING, ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED
]

Submission = DS.Model.extend BaseModelMixin,
  user: DS.belongsTo 'user', inverse: 'submissions', async: false
  status: DS.attr 'number'
  reason: DS.attr 'string'
  source: DS.attr 'number'
  package: DS.attr 'string'

  title: (->
    switch @get "status"
      when ENUMS.SUBMISSION_STATUS.PREPARE_DOWNLOAD then "Preparing to download"
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED then "Failed to download"
      when ENUMS.SUBMISSION_STATUS.PREPARE_VALIDATE then "Preparing to validate"
      when ENUMS.SUBMISSION_STATUS.VALIDATED then "Waiting to scan"
      when ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED then "Failed to validate"
      when ENUMS.SUBMISSION_STATUS.ANALYSING then "Scan has started"
      else "Unknown"
  ).property "status"

  scannerClass: (->
    status = @get "status"
    if status not in [
      ENUMS.SUBMISSION_STATUS.ANALYSING, ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED
    ]
      return "bg-scanning"
  ).property "status"

  panelClass: (->
    status = @get "status"
    switch status
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,  ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED then "panel-danger"
      when ENUMS.SUBMISSION_STATUS.ANALYSING then "panel-success"
      else "panel-info"
  ).property "status"

`export default Submission`
