/* eslint-disable ember/no-array-prototype-extensions, ember/no-mixins, ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-get, prettier/prettier, ember/no-observers, ember/no-actions-hash */
import PaginateMixin from 'irene/mixins/paginate';
import { t } from 'ember-intl';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Component from '@ember/component';
import { observer } from '@ember/object';
import { debounce } from '@ember/runloop';

export default Component.extend(PaginateMixin, {
  intl: service(),
  realtime: service(),
  notify: service('notifications'),

  query: '',
  searchQuery: '',
  isAddingMember: false,
  addMemberErrorCount: 0,

  tTeamMemberAdded: t('teamMemberAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetModel: 'organization-user',
  sortProperties: Object.freeze(['created:desc']),

  init(...args) {
    this._super(...args);
    this.set('selectedMembers', {});
  },

  columns: computed('intl', function () {
    return [
      {
        name: this.get('intl').t('name'),
        valuePath: 'username',
        minWidth: 250,
      },
      {
        name: this.get('intl').t('action'),
        component: 'ak-checkbox',
        textAlign: 'center',
      },
    ];
  }),

  modifiedSortedObjects: computed(
    'sortedObjects',
    'selectedMembers',
    function () {
      return this.get('sortedObjects').map((so) => {
        if (this.get('selectedMembers')[so.id]) {
          so.set('checked', true);
        }

        return so;
      });
    }
  ),

  extraQueryStrings: computed('team.id', 'searchQuery', function () {
    const query = {
      q: this.get('searchQuery'),
      exclude_team: this.get('team.id'),
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationNonTeamMembersObserver: observer(
    'realtime.OrganizationNonTeamMemberCounter',
    function () {
      return this.incrementProperty('version');
    }
  ),

  selectionChange: task(function* (member, event) {
    const selectedMembers = yield this.get('selectedMembers');

    if (event.target.checked) {
      selectedMembers[member.id] = member;
    } else {
      delete selectedMembers[member.id];
    }

    this.set('selectedMembers', { ...selectedMembers });
  }),

  hasNoSelection: computed('selectedMembers', function () {
    return Object.keys(this.get('selectedMembers')).length === 0;
  }),

  /* Add member to team */
  addTeamMember: task(function* (member) {
    try {
      const data = {
        write: false,
      };

      const team = this.get('team');
      yield team.addMember(data, member.id);

      this.get('realtime').incrementProperty('TeamMemberCounter');
      this.get('sortedObjects').removeObject(member);
    } catch (err) {
      let errMsg = this.get('tPleaseTryAgain');

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0].detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.get('notify').error(errMsg);
      this.incrementProperty('addMemberErrorCount');
    }
  })
    .enqueue()
    .maxConcurrency(3),

  addSelectedTeamMembers: task(function* () {
    this.set('isAddingMember', true);

    const selectedMembers = Object.values(this.get('selectedMembers'));

    if (selectedMembers.length === 0) {
      return;
    }

    for (let i = 0; i < selectedMembers.length; i++) {
      yield this.get('addTeamMember').perform(selectedMembers[i]);
    }

    if (this.get('addMemberErrorCount') === 0) {
      this.get('notify').success(this.get('tTeamMemberAdded'));
      this.set('query', '');
      this.set('searchQuery', '');
      this.set('selectedMembers', {});

      triggerAnalytics('feature', ENV.csb.addTeamMember);
    }

    this.set('isAddingMember', false);
  }),

  /* Set debounced searchQuery */
  setSearchQuery() {
    this.set('searchQuery', this.get('query'));
  },

  handleSearchQueryChange: task(function* () {
    yield debounce(this, this.setSearchQuery, 500);
  }),
});
