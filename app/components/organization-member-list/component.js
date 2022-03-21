/* eslint-disable ember/no-classic-components, ember/no-mixins, ember/no-classic-classes, ember/require-tagless-components, prettier/prettier, ember/no-get, ember/no-observers, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import PaginateMixin from 'irene/mixins/paginate';
import { debounce } from '@ember/runloop';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';

export default Component.extend(PaginateMixin, {
  intl: service(),
  organization: service('organization'),
  me: service('me'),
  notify: service('notifications'),
  query: '',
  searchQuery: '',
  showDeactivated: false,
  targetModel: 'organization-member',

  /* computed.sort compares the values with previous value,
    if it's not change same value will return everytime */

  // sortProperties: [],
  sortedObjects: computed.reads('objects'),

  tPleaseTryAgain: t('pleaseTryAgain'),

  extraQueryStrings: computed('showDeactivated', 'searchQuery', function() {
    const query = {
      q: this.get('searchQuery'),
      ...this.get('showDeactivated')!==true && {is_active: true}
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newMembersObserver: observer("realtime.OrganizationMemberCounter", function() {
    return this.incrementProperty("version");
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
    if (this.get('query')!==''){
      this.set('limit', ENV.paginate.perPageLimit);
      this.set('offset', 0);
    }
  },

  resetInitialState(){
    this.setProperties({
      offset: 0,
      meta: null,
    })
  },
  showDeactivatedMembers: task(function*(){
    yield this.resetInitialState()
    yield this.incrementProperty('version');
  }),
  actions: {
    searchQuery() {
      debounce(this, this.setSearchQuery, 500);
    },
  }
});
