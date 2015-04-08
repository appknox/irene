`import Ember from 'ember'`

ApplicationView = Ember.View.extend
  willInsertElement: ->
    $("#initial-loader").remove()
  classNames: ['application-wrapper']

`export default ApplicationView`
