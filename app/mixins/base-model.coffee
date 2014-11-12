`import Ember from 'ember'`
`import DS from 'ember-data'`

BaseModelMixin = Ember.Mixin.create
  createdBy: DS.attr 'number'
  updatedBy: DS.attr 'number'
  createdOn: DS.attr 'date'
  updatedOn: DS.attr 'date'

`export default BaseModelMixin`
