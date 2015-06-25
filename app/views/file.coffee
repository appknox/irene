`import Ember from 'ember';`

FileView = Ember.View.extend
  layoutName: "layouts/application"

  didInsertElement: ->
    appController = @get "controller.controllers.application"
    appController.tourScanDetail()

`export default FileView;`
