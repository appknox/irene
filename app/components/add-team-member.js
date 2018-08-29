import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),
  notify: Ember.inject.service(),

  query: '',
  isAddingMember: false,
  showAddTeamMemberModal: false,

  tTeamMemberAdded: t('teamMemberAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),

  targetObject: 'organization-user',
  sortProperties: ['created:desc'],
  extraQueryStrings: Ember.computed('team.id', function() {
    const query = {
      exclude_team: this.get('team.id')
    };
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newOrganizationNonTeamMembersObserver: Ember.observer("realtime.OrganizationNonTeamMemberCounter", function() {
    return this.incrementProperty("version");
  }),


  /* Open add-team-member modal */
  openAddMemberModal: task(function * () {
    yield this.set('showAddTeamMemberModal', true);
  }),


  /* Add member to team */
  addTeamMember: task(function * (member) {
    this.set('isAddingMember', true);
    const data = {
      write: false
    };
    const team = this.get('team');
    yield team.addMember(data, member.id);

    this.get('realtime').incrementProperty('TeamMemberCounter');
    this.get('sortedObjects').removeObject(member);
  }).evented(),

  addTeamMemberSucceeded: on('addTeamMember:succeeded', function() {
    this.get('notify').success(this.get("tTeamMemberAdded"));

    this.set('isAddingMember', false);
    this.set('query', '');
  }),

  addTeamMemberErrored: on('addTeamMember:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('isAddingMember', false);
    this.set('query', '');
  }),

  // /* Search member */
  // searchMember() {
  //   const searchText = this.get("query");
  //   const that = this;

  //   this.set("isSearchingMember", true);

  //   return this.get('store').query('organization-member', {
  //     q: searchText,
  //     exclude_team: this.get('team.id')
  //   })
  //     .then(function(response) {
  //       if(!that.isDestroyed) {
  //         that.set("isSearchingMember", false);
  //       }
  //       that.set("sortedObjects", response);
  //     })
  //     .catch(function() {
  //       that.set("isSearchingMember", false);
  //     });
  // },

  // actions: {
  //   searchQuery() {
  //     Ember.run.debounce(this, this.searchMember, 500);
  //   },
  // }

});
