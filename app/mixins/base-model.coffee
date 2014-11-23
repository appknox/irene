`import Ember from 'ember';`
`import DS from 'ember-data';`
`import { moment, ago } from 'ember-moment/computed';`

BaseModelMixin = Ember.Mixin.create
  createdBy: DS.belongsTo 'user', async: true
  updatedBy: DS.belongsTo 'user', async: true
  createdOn: DS.attr 'date'
  updatedOn: DS.attr 'date'

  humanizedCreatedOn: ago 'createdOn', true

  humanizedUpdatedOn: ago 'updatedOn', true

`export default BaseModelMixin;`
