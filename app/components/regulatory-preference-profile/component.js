import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { on } from '@ember/object/evented';
import { task } from 'ember-concurrency';
import { t } from 'ember-intl';
import ENUMS from 'irene/enums';

export default Component.extend({
  intl: service(),
  notify: service('notifications'),

  tPleaseTryAgain: t('pleaseTryAgain'),
  tRegulatoryPreferenceReset: t('regulatoryPreferenceReset'),
  tPreferenceSetTo: t('preferenceSetTo'),

  regulatoryVisibilityOptions: ENUMS.REGULATORY_STATUS.BASE_VALUES,

  project: null,

  profile: computed('project.activeProfileId', 'store', function(){
    const profileId = this.get('project.activeProfileId');
    if(!profileId){
      return null;
    }
    return this.store.peekRecord('profile', profileId);
  }),


  /* save pcidss */
  savePcidss: task(function *(status){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.setShowPcidss({value: status});
  }).restartable().evented(),

  savePcidssSucceeded: on('savePcidss:succeeded', function(instance) {
    const [status] = instance.args;
    const statusDisplay = status ? 'SHOW': 'HIDE'
    this.get('notify').success(`PCI-DSS ${this.get('tPreferenceSetTo')} ${statusDisplay}`);
  }),

  savePcidssErrored: on('savePcidss:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.payload && err.payload.detail) {
      errMsg = err.payload.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  /* delete pcidss */
  deletePcidss: task(function *(){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.unsetShowPcidss();
  }).restartable().evented(),

  deletePcidssSucceeded: on('deletePcidss:succeeded', function() {
    this.get('notify').info(this.get('tRegulatoryPreferenceReset'));
  }),

  deletePcidssErrored: on('deletePcidss:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.payload && err.payload.detail) {
      errMsg = err.payload.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  /* save hipaa */
  saveHipaa: task(function *(status){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.setShowHipaa({value: status});
  }).restartable().evented(),

  saveHipaaSucceeded: on('saveHipaa:succeeded', function(instance) {
    const [status] = instance.args;
    const statusDisplay = status ? 'SHOW': 'HIDE'
    this.get('notify').success(`HIPAA ${this.get('tPreferenceSetTo')} ${statusDisplay}`);
  }),

  saveHipaaErrored: on('saveHipaa:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.payload && err.payload.detail) {
      errMsg = err.payload.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),


  /* delete hipaa */
  deleteHipaa: task(function *(){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.unsetShowHipaa();
  }).restartable().evented(),

  deleteHipaaSucceeded: on('deleteHipaa:succeeded', function() {
    this.get('notify').info(this.get('tRegulatoryPreferenceReset'));
  }),

  deleteHipaaErrored: on('deleteHipaa:errored', function(_, err) {
    let errMsg = this.get('tPleaseTryAgain');
    if (err.errors && err.errors.length) {
      errMsg = err.errors[0].detail || errMsg;
    } else if (err.payload && err.payload.detail) {
      errMsg = err.payload.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    this.get('notify').error(errMsg);
  }),

});
