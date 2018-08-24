import Ember from 'ember';
import { translationMacro as t } from 'ember-i18n';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

const TeamOverviewComponent = Ember.Component.extend({

  i18n: Ember.inject.service(),
  team: null,
  organization: null,
  tagName: ["tr"],

  isDeletingTeam: false,
  showDeleteTeamPrompt: false,

  tTeamDeleted: t("teamDeleted"),
  tEnterRightTeamName: t("enterRightTeamName"),

  openDeleteTeamConfirmBox: task(function * () {
    yield this.set('showDeleteTeamPrompt', true);
  }),

  confirmDelete: task(function * (inputValue) {
    this.set('isDeletingTeam', true);
    const t = this.get('team');
    const teamName = t.get("name").toLowerCase();
    const promptedTeam = inputValue.toLowerCase();
    if (promptedTeam !== teamName) {
      throw new Error(this.get("tEnterRightTeamName"));
    }

    t.deleteRecord();
    yield t.save();

  }).evented(),

  confirmDeleteSucceeded: on('confirmDelete:succeeded', function() {
    this.get('notify').success(`${this.get('team.name')} ${this.get('tTeamDeleted')}`);
    this.set('showDeleteTeamPrompt', false);
    this.set('isDeletingTeam', false);
  }),

  confirmDeleteErrored: on('confirmDelete:errored', function(_, error) {
    let errMsg = t('pleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message
    }
    this.get("notify").error(errMsg);
    this.set('showDeleteTeamPrompt', false);
    this.set('isDeletingTeam', false);
  }),

  actions: {
    confirmDeleteProxy(inputValue) {
      this.get('confirmDelete').perform(inputValue);
    },
  }
});


export default TeamOverviewComponent;
