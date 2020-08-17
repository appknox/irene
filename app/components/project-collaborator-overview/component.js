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
  showRemoveCollaboratorConfirm: false,
  isRemovingCollaborator: false,

  tCollaboratorRemoved: t('collaboratorRemoved'),
  tPleaseTryAgain: t('pleaseTryAgain'),
  tPermissionChanged: t('permissionChanged'),

  orgMember: computed('collaborator.id', 'store', function() {
    return this.store.findRecord('organization-user', this.get('collaborator.id'));
  }),


  /* Watch for allowEdit input */
  watchProjectWrite: observer('collaborator.write', function(){
    this.get('changeCollaboratorWrite').perform();
  }),


  /* Save collaborator-write value */
  changeCollaboratorWrite: task(function * () {
    const clb = this.get('collaborator');
    yield clb.updateCollaborator(this.get('project.id'));
  }).evented(),

  changeCollaboratorWriteSucceeded: on('changeCollaboratorWrite:succeeded', function() {
    this.get('notify').success(this.get('tPermissionChanged'));
  }),

  changeCollaboratorWriteErrored: on('changeCollaboratorWrite:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
  }),


  /* Open remove-collaborator confirmation */
  openRemoveCollaboratorConfirm: task(function * () {
    yield this.set('showRemoveCollaboratorConfirm', true);
  }),


  /* Remove collaborator action */
  removeCollaborator: task(function * () {
    this.set('isRemovingCollaborator', true);

    // const clb = yield this.get('store').queryRecord('project-collaborator', {
    //   collaboratorId: this.get('collaborator.id'),
    //   id: this.get('project.id')
    // });
    const clb = this.get('collaborator');
    yield clb.deleteCollaborator(this.get('project.id'));
    // this.get('realtime').incrementProperty('ProjectNonCollaboratorCounter');
    yield this.get('store').unloadRecord(clb);

  }).evented(),

  removeCollaboratorSucceeded: on('removeCollaborator:succeeded', function() {
    this.get('notify').success(this.get('tCollaboratorRemoved'));
    triggerAnalytics('feature', ENV.csb.projectCollaboratorRemove);

    this.set('showRemoveCollaboratorConfirm', false);
    this.set('isRemovingCollaborator', false);
  }),

  removeCollaboratorErrored: on('removeCollaborator:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if(err.message) {
      errMsg = err.message;
    }

    this.get("notify").error(errMsg);
    this.set('isRemovingCollaborator', false);
  }),


  actions: {
    removeCollaboratorProxy() {
      this.get('removeCollaborator').perform();
    }
  }

});
