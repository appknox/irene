`import Ember from 'ember'`

IndexView = Ember.View.extend
  layoutName: "layouts/application"
  didInsertElement: ->
    appController = @get "controller.controllers.application"
    appController.tourScanResult()

`export default IndexView`
