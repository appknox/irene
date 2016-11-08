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
  hide: t("hide")
  show: t("show")

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
    hide = @get "hide"
    show = @get "show"
    if @get "showVulnerability"
      hide
    else
      show
  ).property "showVulnerability"

  actions:
    toggleVulnerability: ->
      return @set "showVulnerability", !@get "showVulnerability"


`export default AnalysisDetailsComponent`
