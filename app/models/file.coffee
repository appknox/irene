`import DS from 'ember-data';`
`import BaseModelMixin from 'irene/mixins/base-model';`
`import ENUMS from 'irene/enums';`
`import Ember from 'ember'`

File = DS.Model.extend BaseModelMixin,
  project: DS.belongsTo 'project', inverse: 'files'
  uuid: DS.attr 'string'
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  dynamicStatus: DS.attr 'number'
  analyses: DS.hasMany 'analysis', inverse: 'file'
  report: DS.attr 'string'
  manual: DS.attr 'number'

  isNoneStaus: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.NONE
  ).property 'dynamicStatus'

  isReady: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.READY
  ).property 'dynamicStatus'

  isOkToRequestManual: (->
    try pricing = @get "project.owner.pricing"
    !Ember.isEmpty(pricing) and pricing.get("offer") in [
      ENUMS.OFFER.NONE, ENUMS.OFFER.CUSTOM]
  ).property "project.owner.pricing"

  isRequestManualEnabled: (->
    manual = @get "manual"
    manual is ENUMS.MANUAL.NONE
  ).property "manual"

  isBooting: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.BOOTING
  ).property 'dynamicStatus'

  isShuttingDown: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.SHUTTING_DOWN
  ).property 'dynamicStatus'


  risks:(->
    risks = []
    analyses = @get "analyses"
    analyses.forEach (analysis)->
      risks.push analysis.get 'risk'
    risks
  ).property "analyses.@each.risk"

`export default File;`
