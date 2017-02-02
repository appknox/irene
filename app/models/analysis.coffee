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
  tScanning: t("scanning")
  tNone: t("none")
  tLow: t("low")
  tMedium: t("medium")
  tHigh: t("high")

  isScanning: ( ->
    risk = @get "risk"
    risk is ENUMS.RISK.UNKNOWN
  ).property "risk"

  isRisky: ( ->
    risk = @get "risk"
    risk isnt ENUMS.RISK.NONE
  ).property "risk"

  hasVulnerabilty: (->
    risk = @get "risk"
    risk not in [ENUMS.RISK.NONE, ENUMS.RISK.UNKNOWN]
  ).property "risk"

  iconClass: (->
    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then "fa-spinner fa-spin"
      when ENUMS.RISK.NONE then "fa-check"
      when ENUMS.RISK.HIGH, ENUMS.RISK.LOW, ENUMS.RISK.MEDIUM  then "fa-warning"
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
    tScanning = @get "tScanning"
    tNone = @get "tNone"
    tLow = @get "tLow"
    tMedium = @get "tMedium"
    tHigh = @get "tHigh"

    switch @get "risk"
      when ENUMS.RISK.UNKNOWN then tScanning
      when ENUMS.RISK.NONE then tNone
      when ENUMS.RISK.LOW then tLow
      when ENUMS.RISK.MEDIUM then tMedium
      when ENUMS.RISK.HIGH then tHigh
  ).property "risk"

`export default Analysis`
