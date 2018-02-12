/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import DS from 'ember-data';

const BaseModelMixin = Ember.Mixin.create({
  createdBy: DS.belongsTo('user'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  uuid: DS.attr('string'),

  createdOnHumanized: Ember.computed("createdOn", function() {
    const createdOn = this.get("createdOn");
    if (Ember.isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toLocaleDateString()}`;
  }),

  createdOnDateTime: Ember.computed("createdOn", function() {
    const createdOn = this.get("createdOn");
    if (Ember.isEmpty(createdOn)) {
      return;
    }
    return `${createdOn.toDateString()}, ${createdOn.toLocaleTimeString()}`;
  })
});    

export default BaseModelMixin;
