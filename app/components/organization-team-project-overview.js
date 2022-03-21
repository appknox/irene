/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/avoid-leaking-state-in-ember-objects, prettier/prettier, ember/no-get, ember/no-observers, ember/no-actions-hash */
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed, observer } from '@ember/object';
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
  showRemoveProjectConfirm: false,
  isRemovingProject: false,

  tProjectRemoved: t('projectRemoved'),
  tPleaseTryAgain: t('pleaseTryAgain'),
  tPermissionChanged: t('permissionChanged'),


  /* Fetch project for the given id */
  teamProject: computed('project.id', 'store', function() {
    return this.get('store').findRecord('project', this.get('project.id'));
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
