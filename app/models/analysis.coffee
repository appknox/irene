`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Analysis = DS.Model.extend
  file: DS.belongsTo 'file', inverse: 'analyses'
  findings: DS.attr()
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'
  vulnerability: DS.belongsTo 'vulnerability'

  isScanning: ( ->
    risk = @get "risk"
    risk is ENUMS.RISK.UNKNOWN
  ).property "risk"

  isRisky: ( ->
    risk = @get "risk"
    risk isnt ENUMS.RISK.NONE
  ).property "risk"

  labelClass:( ->
    cls = 'tag'
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "#{cls} is-default is-progress"
      when ENUMS.RISK.NONE then "#{cls} is-success"
      when ENUMS.RISK.LOW then "#{cls} is-info"
      when ENUMS.RISK.MEDIUM then "#{cls} is-warning"
      when ENUMS.RISK.HIGH then "#{cls} is-danger"
  ).property "risk"

  riskText:( ->
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "Scanning"
      when ENUMS.RISK.NONE then "None"
      when ENUMS.RISK.LOW then "Low"
      when ENUMS.RISK.MEDIUM then "Medium"
      when ENUMS.RISK.HIGH then "High"
  ).property "risk"

`export default Analysis`
