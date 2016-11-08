`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import { translationMacro as t } from 'ember-i18n'`

CompareSummaryComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  comparison: null

  classNames: ["columns"]

  beingAnalyzed: t("beingAnalyzed")
  remainsUnchanged: t("remainsUnchanged")
  hasImproved: t("hasImproved")
  gottenWorse: t("gottenWorse")

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

    beingAnalyzed = @get "beingAnalyzed"
    remainsUnchanged = @get "remainsUnchanged"
    hasImproved = @get "hasImproved"
    gottenWorse = @get "gottenWorse"

    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      beingAnalyzed
    else if file1Risk is file2Risk
      remainsUnchanged
    else if file1Risk > file2Risk
      hasImproved
    else if file1Risk < file2Risk
      gottenWorse
  ).property "file1Analysis.risk", "file2Analysis.risk"


`export default CompareSummaryComponent`
