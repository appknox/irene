import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';

export default Component.extend({
  regulatoryVisibilityOptions: ENUMS.REGULATORY_STATUS.BASE_VALUES,

  project: null,

  profile: computed('project.activeProfileId', function(){
    const profileId = this.get('project.activeProfileId');
    if(!profileId){
      return null;
    }
    return this.store.peekRecord('profile', profileId);
  }),

  savePcidss: task(function *(status){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.setShowPcidss({value: status});
  }).restartable(),

  deletePcidss: task(function *(){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.unsetShowPcidss();
  }).restartable(),

  saveHipaa: task(function *(status){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.setShowHipaa({value: status});
  }).restartable(),

  deleteHipaa: task(function *(){
    const profile = this.store.peekRecord('profile', this.get('project.activeProfileId'));
    yield profile.unsetShowHipaa();
  }).restartable(),

});
