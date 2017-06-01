`import Ember from 'ember'`
`import DS from 'ember-data'`

BaseModelMixin = Ember.Mixin.create
  createdBy: DS.belongsTo 'user'
  createdOn: DS.attr 'date'
  updatedOn: DS.attr 'date'
  uuid: DS.attr 'string'

  createdOnHumanized: Ember.computed "createdOn", ->
    createdOn = @get "createdOn"
    if Ember.isEmpty createdOn
      return
    "#{createdOn.toLocaleDateString()}"

  updatedOnHumanized: Ember.computed "updatedOn", ->
    updatedOn = @get "updatedOn"
    if Ember.isEmpty updatedOn
      return
    "#{updatedOn.toLocaleDateString()}"

`export default BaseModelMixin`
