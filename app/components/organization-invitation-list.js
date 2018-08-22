import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

export default Ember.Component.extend(PaginateMixin, {

  i18n: Ember.inject.service(),

  targetObject: 'organization-invitation',
  sortProperties: ['created:desc'],

  extraQueryStrings: Ember.computed('organization.id', function() {
    const query = {
      id: this.get("organization.id")
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

});
