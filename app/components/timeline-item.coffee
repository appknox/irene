`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

TimelineItemComponent = Ember.Component.extend
  tagName: "article"
  classNames: ["timeline-item"]
  classNameBindings: ["itemClass"]
  model: null
  file1: null
  file2: null

  vulnerability: (->
    @get("model")["vulnerability"]
  ).property "model"

  itemClass: (->
    id = @get "vulnerability.id"
    if id % 2 is 0
      "alt"
  ).property "vulnerability"

  arrowClass: (->
    id = @get "vulnerability.id"
    if id % 2 is 0
      "right"
    else
      "left"
  ).property "vulnerability"

  file1Analysis: (->
    @get("model")['analysis1']
  ).property "model"

  file2Analysis: (->
    @get("model")['analysis2']
  ).property "model"

  compareColor: (->
    file1Risk = @get "file1Analysis.risk"
    file2Risk = @get "file2Analysis.risk"
    if ENUMS.RISK.UNKNOWN in [file1Risk, file2Risk]
      "bg-scanning fa-question bg-warning text-black"
    else if file1Risk is file2Risk
      "bg-info fa-circle"
    else if file1Risk > file2Risk
      "bg-success fa-plus"
    else if file1Risk < file2Risk
      "bg-danger fa-minus"
  ).property "file1Analysis.risk", "file2Analysis.risk"

`export default TimelineItemComponent`
