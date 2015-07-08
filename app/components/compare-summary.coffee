`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

CompareSummaryComponent = Ember.Component.extend

  model: null
  file1: null
  file2: null
  classNames: ["col-md-12"]

  vulnerability: (->
    @get("model")["vulnerability"]
  ).property "model"

  file1Analysis: (->
    @get("model")['analysis1']
  ).property "model"

  file2Analysis: (->
    @get("model")['analysis2']
  ).property "model"

  compareColor: (->
    cls = 'label'
    file1Risk = @get "file1Analysis.risk"
    file2Risk = @get "file2Analysis.risk"
    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      "#{cls} label-default bg-scanning"
    else if file1Risk is file2Risk
      "#{cls} label-default"
    else if file1Risk > file2Risk
      "#{cls} label-success"
    else if file1Risk < file2Risk
      "#{cls} label-danger"
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
