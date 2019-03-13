import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
import { task } from 'ember-concurrency';
import { on } from '@ember/object/evented';
import { translationMacro as t } from 'ember-i18n';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export default Component.extend({
  i18n: service(),
  realtime: service(),
  me: service(),
  notify: service('notification-messages-service'),

  tagName: ['tr'],
  showRemoveProjectConfirm: false,
  isRemovingProject: false,

  tProjectRemoved: t('projectRemoved'),
  tPleaseTryAgain: t('pleaseTryAgain'),
  tPermissionChanged: t('permissionChanged'),


  /* Fetch project for the given id */
  teamProject: computed('project,id', function() {
    const id = this.get('project.id');
    return this.get('store').queryRecord('project', {id});
  }),


  /* Watch for allowEdit input */
  watchProjectWrite: observer('project.write', function(){
    this.get('changeProjectWrite').perform();
  }),


  /* Save project-write value */
  changeProjectWrite: task(function * () {
    const prj = this.get('project');
    yield prj.updateProject(this.get('team.id'));
  }).evented(),

  changeProjectWriteSucceeded: on('changeProjectWrite:succeeded', function() {
    this.get('notify').success(this.get('tPermissionChanged'));
  }),

  changeProjectWriteErrored: on('changeProjectWrite:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  }),


  /* Open remove-project confirmation */
  openRemoveProjectConfirm: task(function * () {
    yield this.set('showRemoveProjectConfirm', true);
  }),


  /* Remove project action */
  removeProject: task(function * () {
    this.set('isRemovingProject', true);

    const prj = this.get('project');
    const teamId = this.get('team.id');
    yield prj.deleteProject(teamId);
    yield this.get('store').unloadRecord(prj);

  }).evented(),

  removeProjectSucceeded: on('removeProject:succeeded', function() {
    this.get('notify').success(this.get('tProjectRemoved'));
    triggerAnalytics('feature', ENV.csb.teamProjectRemove);

    this.set('showRemoveProjectConfirm', false);
    this.set('isRemovingProject', false);

    this.get('realtime').incrementProperty('OrganizationNonTeamProjectCounter');
  }),

  removeProjectErrored: on('removeProject:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
    this.set('isRemovingProject', false);
  }),


  actions: {
    removeProjectProxy() {
      this.get('removeProject').perform();
    }
  }

});
