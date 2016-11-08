`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`
`import { translationMacro as t } from 'ember-i18n'`

AnalysisDetailsComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  analysis: null
  tagName: "article"
  classNames: ["message"]
  showVulnerability: false
  classNameBindings: ["riskClass"]
  tHide: t("hide")
  tShow: t("show")

  riskClass: ( ->
    risk = @get "analysis.risk"
    switch risk
      when ENUMS.RISK.NONE
        "is-success"
      when ENUMS.RISK.LOW
        "is-info"
      when ENUMS.RISK.MEDIUM
        "is-warning"
      when ENUMS.RISK.HIGH
        "is-danger"
  ).property "analysis.risk"

  progressClass: ( ->
    risk = @get "analysis.risk"
    switch risk
      when ENUMS.RISK.UNKNOWN
        "is-progress"
  ).property "analysis.risk"

  showOrHide: (->
    tHide = @get "tHide"
    tShow = @get "tShow"
    if @get "showVulnerability"
      tHide
    else
      tShow
  ).property "showVulnerability"

  actions:
    toggleVulnerability: ->
      return @set "showVulnerability", !@get "showVulnerability"


`export default AnalysisDetailsComponent`
