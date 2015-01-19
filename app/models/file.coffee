`import DS from 'ember-data';`
`import BaseModelMixin from '../mixins/base-model';`
`import ENUMS from '../enums';`

File = DS.Model.extend BaseModelMixin,
  project: DS.belongsTo 'project', inverse: 'files'
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  dynamicStatus: DS.attr 'number'
  ip: DS.attr 'string'
  analyses: DS.hasMany 'analysis', inverse: 'file'
  report: DS.attr 'string'

  isNoneStaus: (->
    status = @get 'dynamicStatus'
    status is ENUMS.DYNAMIC_STATUS.NONE
  ).property 'dynamicStatus'

  risks:(->
    risks = []
    analyses = @get "analyses"
    analyses.forEach (analysis)->
      risks.push analysis.get 'risk'
    risks
  ).property "analyses.@each.risk"

`export default File;`
