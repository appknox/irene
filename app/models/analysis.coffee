`import DS from 'ember-data';`
`import ENUMS from 'irene/enums';`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analyses', async:false
  description: DS.attr 'string'
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'
  vulnerability: DS.belongsTo 'vulnerability', async:false

  panelHeadingClass:( ->
    cls = 'panel-heading'
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "#{cls} bg-scanning"
      when ENUMS.RISK.NONE then "#{cls} bg-success"
      when ENUMS.RISK.LOW then "#{cls} bg-info"
      when ENUMS.RISK.MEDIUM then "#{cls} bg-warning"
      when ENUMS.RISK.HIGH then "#{cls} bg-danger"
  ).property "risk"

  labelClass:( ->
    cls = 'label'
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "#{cls} label-default bg-scanning"
      when ENUMS.RISK.NONE then "#{cls} label-success"
      when ENUMS.RISK.LOW then "#{cls} label-info"
      when ENUMS.RISK.MEDIUM then "#{cls} label-warning"
      when ENUMS.RISK.HIGH then "#{cls} label-danger"
  ).property "risk"

  riskText:( ->
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "Scanning"
      when ENUMS.RISK.NONE then "None"
      when ENUMS.RISK.LOW then "Low"
      when ENUMS.RISK.MEDIUM then "Medium"
      when ENUMS.RISK.HIGH then "High"
  ).property "risk"

  descriptions:(->
    JSON.parse @get "description"
  ).property "description"

  isScanning:(->
    ENUMS.RISK.UNKNOWN is @get "risk"
  ).property "risk"

  isRisky:(->
    return false if @get "isScanning"
    ENUMS.RISK.NONE isnt @get "risk"
  ).property "risk"

`export default Analysis;`
