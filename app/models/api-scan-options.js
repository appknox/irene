/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/require-return-from-computed, ember/no-get */
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  apiUrlFilters: attr('string'),

  apiUrlFilterItems: computed("apiUrlFilters", function() {
    const apiUrlFilters = this.get("apiUrlFilters");
    if (!isEmpty(apiUrlFilters)) {
      return (apiUrlFilters != null ? apiUrlFilters.split(",") : undefined);
    }
  }),

  hasApiUrlFilters: computed.alias('apiUrlFilterItems.length'),

});
