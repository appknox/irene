`import Ember from 'ember'`

ApplicationView = Ember.View.extend
  willInsertElement: ->
    $("#initial-loader").remove()

`export default ApplicationView`
