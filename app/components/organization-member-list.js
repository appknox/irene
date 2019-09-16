import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';
import { debounce } from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  intl: service(),

  query: '',
  searchQuery: '',

  targetModel: 'organization-member',
  sortProperties: ['createdOn:desc'],

  extraQueryStrings: computed('searchQuery', function() {
    const query = {
      q: this.get('searchQuery')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newMembersObserver: observer("realtime.OrganizationMemberCounter", function() {
    return this.incrementProperty("version");
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
  },

  actions: {
    searchQuery() {
      debounce(this, this.setSearchQuery, 500);
    },
  }
});
