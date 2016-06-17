`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model';`
`import ENUMS from 'irene/enums';`


Submission = DS.Model.extend BaseModelMixin,
  user: DS.belongsTo 'user', inverse: 'submissions', async: false
  status: DS.attr 'number'
  reason: DS.attr 'string'
  source: DS.attr 'number'
  package: DS.attr 'string'

  title: (->
    status = @get "status"
    switch status
      when ENUMS.SUBMISSION_STATUS.PREPARE_DOWNLOAD then "Preparing to download"
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED then "Failed to download"
      else "foosh"
  ).property "status"

  scannerClass: (->
    status = @get "status"
    switch status
      when ENUMS.SUBMISSION_STATUS.PREPARE_DOWNLOAD then "bg-scanning"
      else "foosh"
  ).property "status"

  panelClass: (->
    status = @get "status"
    switch status
      when ENUMS.SUBMISSION_STATUS.PREPARE_DOWNLOAD then "panel-info"
      when ENUMS.SUBMISSION_STATUS.DOWNLOAD_FAILED then "panel-danger"
      else "foosh"
  ).property "status"

`export default Submission`
