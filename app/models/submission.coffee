`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Submission = DS.Model.extend
  user: DS.belongTo 'user', inverse: 'submission', async:false
  metaData: DS.attr 'string'
  status: DS.attr 'number'
  reason:DS.attr 'string'
  source: DS.attr 'number'
  package: DS.attr 'string'
  statusHumanized: DS.attr 'string'

  scannerClass: ( ->
    status = @get "status"
    if status not in [
      ENUMS.SUBMISSION_STATUS.ANALYZING,
      ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED,
      ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED
    ]
      return "bg-scanning"
  ).property "status"

  panelClass: ( ->
    status = @get "status"
    switch status
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED, ENUMS.SUBMISSION_STATUS.VALIDATE_FAILED then "panel-danger"
      when ENUMS.SUBMISSION_STATUS.ANALYZING then "panel-success"
      else "panel-info"
  ).property "status"

  hasReason:( ->
    reason = @get "reason"
    reason.length > 0
  ).property "reason"

`export default Submission`
