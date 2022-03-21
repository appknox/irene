/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-observers, ember/no-get, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { t } from 'ember-intl';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  intl: service(),
  realtime: service(),
  me: service(),
  notify: service('notifications'),

  tagName: ['tr'],
  showRemoveTeamConfirm: false,
  isRemovingTeam: false,

  tTeamRemoved: t('teamRemoved'),
  tPleaseTryAgain: t('pleaseTryAgain'),
  tPermissionChanged: t('permissionChanged'),


  /* Watch for allowEdit input */
  watchProjectWrite: observer('team.write', function(){
    this.get('changeTeamWrite').perform();
  }),


  /* Save team-write value */
  changeTeamWrite: task(function * () {
    const prj = yield this.get('store').queryRecord('organization-team-project', {
      teamId: this.get('team.id'),
      id: this.get('project.id')
    });
    prj.set('write', this.get('team.write'));
    yield prj.updateProject(this.get('team.id'));
  }).evented(),

  changeTeamWriteSucceeded: on('changeTeamWrite:succeeded', function() {
    this.get('notify').success(this.get('tPermissionChanged'));
  }),

  changeTeamWriteErrored: on('changeTeamWrite:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  }),


  /* Open remove-team confirmation */
  openRemoveTeamConfirm: task(function * () {
    yield this.set('showRemoveTeamConfirm', true);
  }),


  /* Remove team action */
  removeTeam: task(function * () {
    this.set('isRemovingTeam', true);

    const prj = yield this.get('store').queryRecord('organization-team-project', {
      teamId: this.get('team.id'),
      id: this.get('project.id')
    });
    const team = this.get('team');
    yield prj.deleteProject(team.id);
    this.get('realtime').incrementProperty('ProjectNonTeamCounter');
    yield this.get('store').unloadRecord(team);

  }).evented(),

  removeTeamSucceeded: on('removeTeam:succeeded', function() {
    this.get('notify').success(this.get('tTeamRemoved'));
    triggerAnalytics('feature', ENV.csb.projectTeamRemove);

    this.set('showRemoveTeamConfirm', false);
    this.set('isRemovingTeam', false);
  }),

  removeTeamErrored: on('removeTeam:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
    this.set('isRemovingTeam', false);
  }),


  actions: {
    removeTeamProxy() {
      this.get('removeTeam').perform();
    }
  }

});
