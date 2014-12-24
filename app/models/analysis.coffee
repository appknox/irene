`import DS from 'ember-data';`
`import ENUMS from '../enums';`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analyses'
  description: DS.attr 'string'
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'
  vulnerability: DS.belongsTo 'vulnerability'

  panelHeadingClass:( ->
    cls = 'panel-heading'
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "#{cls} bg-scanning"
      when ENUMS.RISK.NONE then "#{cls} bg-success"
      when ENUMS.RISK.LOW then "#{cls} bg-info"
      when ENUMS.RISK.MEDIUM then "#{cls} bg-warning"
      when ENUMS.RISK.HIGH then "#{cls} bg-danger"
  ).property "risk"

  isScanning:(->
    ENUMS.RISK.UNKNOWN is @get "risk"
  ).property "risk"

  isRisky:(->
    return false if @get "isScanning"
    ENUMS.RISK.NONE isnt @get "risk"
  ).property "risk"

`export default Analysis;`
