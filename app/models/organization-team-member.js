import Model from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  user: computed('id', 'store', function() {
    return this.store.findRecord('organization-user', this.get('id'));
  }),
});
