import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
  project: null,

  profile: computed('project.activeProfileId', function(){
    const profileId = this.get('project.activeProfileId');
    if(!profileId){
      return null;
    }
    return this.get("store").findRecord('profile', profileId);
  }),

  reportPreference: computed('profile.id', function() {
    return this.get('profile.reportPreference');
  }),

  savePcidss: task(function *(value){
    yield this.get('saveReportPreference').perform({
      show_pcidss: value
    });
  }).restartable(),

  saveHipaa: task(function *(value){
    yield this.get('saveReportPreference').perform({
      show_hipaa: value
    });
  }).restartable(),

  saveReportPreference: task(function *(newPref) {
    const profile = this.store.peekRecord('profile', this.get('profile.id'));
    let pref = profile.get('reportPreference');
    yield profile.saveReportPreference({...pref, ...newPref});
  }).restartable(),
});
