import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  user: Ember.computed('id', function() {
    return this.store.findRecord('organization-user', this.get('id'));
  }),
});
