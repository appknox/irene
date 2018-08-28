import Ember from 'ember';
import PaginateMixin from 'irene/mixins/paginate';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

export default Ember.Component.extend(PaginateMixin, {
  i18n: Ember.inject.service(),
  realtime: Ember.inject.service(),

  email: '',
  users: [],
  isAddingMember: false,
  showAddTeamMemberModal: false,

  tTeamMemberAdded: t('teamMemberAdded'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open add-team-member modal */
  openAddMemberModal: task(function * () {
    yield this.set('showAddTeamMemberModal', true);
  }),


  /* Add member to team */
  addTeamMember: task(function * (userId) {
    const id = userId;
    const teamId = this.get('team.id');
    this.set('isAddingMember', true);

    const m = yield this.get('store').createRecord('organization-team-member', {id, teamId});
    yield m.save();
  }).evented(),

  addTeamMemberSucceeded: on('addTeamMember:succeeded', function() {
    this.get('notify').success(this.get("tTeamMemberAdded"));

    this.set('showAddTeamMemberModal', false);
    this.set('isAddingMember', false);
  }),

  addTeamMemberErrored: on('addTeamMember:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);

    this.set('showAddTeamMemberModal', false);
    this.set('isAddingMember', false);
  }),


  /* Search member */
  searchMember() {
    const searchText = this.get("query");
    const that = this;
    this.set("isSearchingMember", true);
    return this.get('store').query('organization-user', {q: searchText})
    .then(function(response) {
      if(!that.isDestroyed) {
        that.set("isSearchingMember", false);
      }
      that.set("users", response);
    })
    .catch(function() {
      that.set("isSearchingMember", false);
    });
  },

  actions: {
    searchQuery() {
      Ember.run.debounce(this, this.searchMember, 500);
    },
  }

});
