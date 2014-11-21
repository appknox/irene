`import Ember from 'ember';`
`import DS from 'ember-data';`

BaseModelMixin = Ember.Mixin.create
  createdBy: DS.belongsTo 'user', async: true
  updatedBy: DS.belongsTo 'user', async: true
  createdOn: DS.attr 'date'
  updatedOn: DS.attr 'date'

`export default BaseModelMixin;`
