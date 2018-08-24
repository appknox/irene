import Ember from 'ember';
import ENV from 'irene/config/environment';
import { translationMacro as t } from 'ember-i18n';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';

const CreateTeamComponent = Ember.Component.extend({
  i18n: Ember.inject.service(),
  ajax: Ember.inject.service(),
  notify: Ember.inject.service('notification-messages-service'),
  tTeamCreated: t("teamCreated"),
  tEnterTeamName: t("enterTeamName"),
  teamName: "",
  isCreatingTeam: false,
  showTeamModal: false,

  openTeamModal: task(function * () {
    yield this.set("showTeamModal", true);
  }).evented(),

  createTeam: task(function * () {
    const teamName = this.get("teamName");
    if(Ember.isEmpty(teamName)) {
      throw new Error(this.get("tEnterTeamName"));
    }
    this.set('isCreatingTeam', true);
    const t = this.get("store").createRecord('organization-team', {name: teamName});
    yield t.save();

    this.get('realtime').incrementProperty('OrganizationTeamCounter');
  }).evented(),

  createTeamSucceeded: on('createTeam:succeeded', function() {
    this.get('notify').success(this.get('tTeamCreated'));
    triggerAnalytics('feature', ENV.csb.createTeam);
    this.set("teamName", '');
    this.set('showTeamModal', false);
    this.set('isCreatingTeam', false);
  }),
  createTeamErrored: on('createTeam:errored', function(_, error) {
    let errMsg = t('pleaseTryAgain');
    if (error.errors && error.errors.length) {
      errMsg = error.errors[0].detail || errMsg;
    } else if(error.message) {
      errMsg = error.message
    }
    this.get("notify").error(errMsg);
    this.set("teamName", '');
    this.set('showTeamModal', false);
    this.set('isCreatingTeam', false);
  }),
});


export default CreateTeamComponent;
