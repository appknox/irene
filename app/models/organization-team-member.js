import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  user: computed('id', 'store', function() {
    return this.store.findRecord('organization-user', this.get('id'));
  }),
});
