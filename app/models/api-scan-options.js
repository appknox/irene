import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import DS from 'ember-data';

export default DS.Model.extend({
  apiUrlFilters: DS.attr('string'),

  apiUrlFilterItems: computed("apiUrlFilters", function() {
    const apiUrlFilters = this.get("apiUrlFilters");
    if (!isEmpty(apiUrlFilters)) {
      return (apiUrlFilters != null ? apiUrlFilters.split(",") : undefined);
    }
  }),

  hasApiUrlFilters: computed.alias('apiUrlFilterItems.length'),

});
