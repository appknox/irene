import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),

  query: '',
  searchQuery: '',

  targetObject: 'organization-member',
  sortProperties: ['createdOn:desc'],

  extraQueryStrings: Ember.computed('searchQuery', function() {
    const query = {
      q: this.get('searchQuery')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newMembersObserver: Ember.observer("realtime.OrganizationMemberCounter", function() {
    return this.incrementProperty("version");
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
  },

  actions: {
    searchQuery() {
      Ember.run.debounce(this, this.setSearchQuery, 500);
    },
  }
});
