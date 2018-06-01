import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  apiUrlFilters: DS.attr('string'),

  apiUrlFilterItems:(function() {
    const apiUrlFilters = this.get("apiUrlFilters");
    if (!Ember.isEmpty(apiUrlFilters)) {
      return (apiUrlFilters != null ? apiUrlFilters.split(",") : undefined);
    }
  }).property("apiUrlFilters"),

  hasApiUrlFilters: Ember.computed.alias('apiUrlFilterItems.length'),

});
