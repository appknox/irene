`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`
`import { translationMacro as t } from 'ember-i18n'`


Analysis = DS.Model.extend
  i18n: Ember.inject.service()
  file: DS.belongsTo 'file', inverse: 'analyses'
  description: DS.attr()
  analiserVersion: DS.attr 'number'
  risk: DS.attr 'number'
  status: DS.attr 'number'
  vulnerability: DS.belongsTo 'vulnerability'
  scanning: t("scanning")
  none: t("none")
  low: t("low")
  medium: t("medium")
  high: t("high")

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
      when ENUMS.RISK.UNKNOWN then "#{cls} is-progress"
      when ENUMS.RISK.NONE then "#{cls} is-success"
      when ENUMS.RISK.LOW then "#{cls} is-info"
      when ENUMS.RISK.MEDIUM then "#{cls} is-warning"
      when ENUMS.RISK.HIGH then "#{cls} is-danger"
  ).property "risk"

  riskText:( ->
    scanning = @get "scanning"
    none = @get "none"
    low = @get "low"
    medium = @get "medium"
    high = @get "high"

    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then scanning
      when ENUMS.RISK.NONE then none
      when ENUMS.RISK.LOW then low
      when ENUMS.RISK.MEDIUM then medium
      when ENUMS.RISK.HIGH then high
  ).property "risk"

`export default Analysis`
