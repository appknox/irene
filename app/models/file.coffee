`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`
`import Ember from 'ember'`

File = DS.Model.extend
  project: DS.belongsTo 'project', inverse:'files', async:false
  uuid: DS.attr 'string'
  deviceToken: DS.attr 'string'
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  dynamicStatus: DS.attr 'number'
  analyses: DS.hasMany 'analysis', inverse: 'file', async:false
  report: DS.attr 'string'
  manual: DS.attr 'number'

  isNoneStatus:( ->
    status = @get "dynamicStatus"
    status is ENUMS.DYNAMIC_STATUS.NONE
  ).property "dynamicStatus"

  isReady:(->
    status = @get "dynamicStatus"
    status is ENUMS.DYNAMIC_STATUS.READY
  ).property "dynamicStatus"

  isOKToRequestManual:( ->
    try pricing = @get "project.owner.pricing"
    !Ember.isEmpty(pricing) and pricing.get "manual"
  ).propert "project.owner.pricing"

  isRequestManualEnabled:( ->
    manual = @get "manual"
    manual is ENUMS.MANUAL.NONE
  ).property "manual"

  isBooting:( ->
    status = @get "dynamicStatus"
    status is ENUMS.DYNAMIC_STATUS.BOOTING
  ).property "dynamicStatus"

  isShuttingDown:( ->
    status = @get "dynamicStatus"
    status is ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN
  ).property "dynamicStatus"

  risks:( ->
    risks = []
    analyses = @get "analyses"
    analyses.forEach (analysis)->
      risks.push analysis.get 'risk'
    risks
  ).property  "analyses.@each.risk"

  otherFilesInTheProject: Ember.computed.filter 'project.files', (file) ->
    file_id = @get "id"
    file_id isnt file.get "id"

`export default File`
