`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`

CompareSummaryComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  comparison: null

  tagName: ["tbody"]

  tBeingAnalyzed: t("beingAnalyzed")
  tRemainsUnchanged: t("remainsUnchanged")
  tHasImproved: t("hasImproved")
  tGottenWorse: t("gottenWorse")

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

    tBeingAnalyzed = @get "tBeingAnalyzed"
    tRemainsUnchanged = @get "tRemainsUnchanged"
    tHasImproved = @get "tHasImproved"
    tGottenWorse = @get "tGottenWorse"

    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      tBeingAnalyzed
    else if file1Risk is file2Risk
      tRemainsUnchanged
    else if file1Risk > file2Risk
      tHasImproved
    else if file1Risk < file2Risk
      tGottenWorse
  ).property "file1Analysis.risk", "file2Analysis.risk"


`export default CompareSummaryComponent`
