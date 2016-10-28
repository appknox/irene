`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

CompareSummaryComponent = Ember.Component.extend
  comparison: null

  classNames: ["columns"]

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
    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      "is being analyzed"
    else if file1Risk is file2Risk
      "remains unchanged"
    else if file1Risk > file2Risk
      "has improved"
    else if file1Risk < file2Risk
      "has gotten worse"
  ).property "file1Analysis.risk", "file2Analysis.risk"


`export default CompareSummaryComponent`
