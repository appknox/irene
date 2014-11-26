`import DS from 'ember-data';`
`import ENUMS from '../enums';`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analyses'
  description: DS.attr 'string'
  extraDesc: DS.attr 'string'
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'

  panelHeadingClass:( ->
    cls = 'panel-heading'
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "#{cls} scanning"
      when ENUMS.RISK.NONE then "#{cls} bg-success"
      when ENUMS.RISK.LOW then "#{cls} bg-primary"
      when ENUMS.RISK.MEDIUM then "#{cls} bg-warning"
      when ENUMS.RISK.HIGH then "#{cls} bg-danger"
  ).property "risk"

`export default Analysis;`
