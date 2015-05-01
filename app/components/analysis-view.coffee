`import Ember from 'ember'`

AnalysisViewComponent = Ember.Component.extend
  classNames: ["col-md-12"]
  model: null
  implicationVisible: false

  actions:
    makeImplicationVisible: ->
      @set "implicationVisible", true

`export default AnalysisViewComponent`
