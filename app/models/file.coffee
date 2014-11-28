`import DS from 'ember-data';`
`import BaseModelMixin from '../mixins/base-model';`

File = DS.Model.extend BaseModelMixin,
  project: DS.belongsTo 'project', inverse: 'files', async: true
  version: DS.attr 'string'
  iconUrl: DS.attr 'string'
  md5hash: DS.attr 'string'
  sha1hash: DS.attr 'string'
  name: DS.attr 'string'
  analyses: DS.hasMany 'analysis', inverse: 'file', async: true

  risks:(->
    risks = []
    analyses = @store.all "analysis", file: @get "id"
    analyses.forEach (analysis)->
      risks.push analysis.get 'risk'
    risks
  ).property "analyses.@each.risk"

`export default File;`
