import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

const TeamOverviewComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  me: Ember.inject.service(),

  team: null,
  isDeletingTeam: false,
  showDeleteTeamPrompt: false,

  tEnterRightTeamName: t('enterRightTeamName'),
  tTeamDeleted: t('teamDeleted'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open delete-team confirmation */
  openDeleteTeamConfirmBox: task(function * () {
    yield this.set('showDeleteTeamPrompt', true);
  }),


  /* Delete team */
  confirmDelete: task(function * (inputValue) {
    this.set('isDeletingTeam', true);
    const t = this.get('team');
    const teamName = t.get("name").toLowerCase();
    const promptedTeam = inputValue.toLowerCase();
    if (promptedTeam !== teamName) {
      throw new Error(this.get('tEnterRightTeamName'));
    }
    t.deleteRecord();
    yield t.save();

  }).evented(),

  confirmDeleteSucceeded: on('confirmDelete:succeeded', function() {
    this.get('notify').success(`${this.get('team.name')} ${this.get('tTeamDeleted')}`);
    this.set('showDeleteTeamPrompt', false);
    this.set('isDeletingTeam', false);
  }),

  confirmDeleteErrored: on('confirmDelete:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }
    this.get("notify").error(errMsg);
    this.set('isDeletingTeam', false);
  }),


  actions: {
    confirmDeleteProxy(inputValue) {
      this.get('confirmDelete').perform(inputValue);
    },
  }

});


export default TeamOverviewComponent;
