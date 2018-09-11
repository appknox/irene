import Ember from 'ember';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { translationMacro as t } from 'ember-i18n';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

const CreateTeamComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),

  teamName: "",
  isCreatingTeam: false,
  showTeamModal: false,

  tEnterTeamName: t('enterTeamName'),
  tTeamCreated: t('teamCreated'),
  tPleaseTryAgain: t('pleaseTryAgain'),


  /* Open create-team modal */
  openTeamModal: task(function * () {
    yield this.set("showTeamModal", true);
  }).evented(),


  /* Create team */
  createTeam: task(function * () {
    const teamName = this.get("teamName");

    if(Ember.isEmpty(teamName)) {
      throw new Error(this.get('tEnterTeamName'));
    }

    this.set('isCreatingTeam', true);
    const t = this.get("store").createRecord('organization-team', {name: teamName});
    yield t.save();

    // signal to update invitation list
    this.get('realtime').incrementProperty('OrganizationTeamCounter');
  }).evented(),

  createTeamSucceeded: on('createTeam:succeeded', function() {
    this.get('notify').success(this.get('tTeamCreated'));
    triggerAnalytics('feature', ENV.csb.createTeam);

    this.set("teamName", '');
    this.set('showTeamModal', false);
    this.set('isCreatingTeam', false);
  }),

  createTeamErrored: on('createTeam:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message
    }

    this.get("notify").error(errMsg);
    this.set('isCreatingTeam', false);
  }),


});


export default CreateTeamComponent;
