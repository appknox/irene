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


`export default Analysis`
