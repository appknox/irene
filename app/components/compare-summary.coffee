`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`

CompareSummaryComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  comparison: null

  tagName: ["tr"]

  tAnalyzing: t("analyzing")
  tUnchanged: t("unchanged")
  tImproved: t("improved")
  tWorsened: t("worsened")

  vulnerability: (->
    @get("comparison")["vulnerability"]
  ).property "comparison"

  file1Analysis: (->
    @get("comparison")['analysis1']
  ).property "comparison"

  file2Analysis: (->
    @get("comparison")['analysis2']
  ).property "comparison"

  compareColor: (->
    cls = 'tag'
    file1Risk = @get "file1Analysis.risk"
    file2Risk = @get "file2Analysis.risk"
    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      "#{cls} is-progress"
    else if file1Risk is file2Risk
      "#{cls} is-default"
    else if file1Risk > file2Risk
      "#{cls} is-success"
    else if file1Risk < file2Risk
      "#{cls} is-danger"
  ).property "file1Analysis.risk", "file2Analysis.risk"

  compareText: (->
    file1Risk = @get "file1Analysis.risk"
    file2Risk = @get "file2Analysis.risk"

    tAnalyzing = @get "tAnalyzing"
    tUnchanged = @get "tUnchanged"
    tImproved = @get "tImproved"
    tWorsened = @get "tWorsened"

    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      tAnalyzing
    else if file1Risk is file2Risk
      tUnchanged
    else if file1Risk > file2Risk
      tImproved
    else if file1Risk < file2Risk
      tWorsened
  ).property "file1Analysis.risk", "file2Analysis.risk"


`export default CompareSummaryComponent`
