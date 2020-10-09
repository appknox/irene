import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { computed } from '@ember/object';

export default DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('organization-user'),
  createdOn: DS.attr('date'),
  projects: DS.attr(),
  typeValue: computed('type', function() {
    return ENUMS.CLEANUP_TYPE[this.get('type')] || "NIL";
  }),

  triggerCleanup: function () {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter._triggerCleanup(this.store, this.constructor.modelName, this);
  }
});
