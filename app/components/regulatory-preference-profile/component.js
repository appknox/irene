import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import ENUMS from 'irene/enums';
import regulatoryStatusMap from 'irene/utils/regulatory-status-map';

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

  reportPreference: computed('profile.id', function() {
    return this.get('profile.reportPreference');
  }),

  pcidssToString: computed("profile.reportPreference.show_pcidss", function() {
    const pcidss = this.get("profile.reportPreference.show_pcidss");
    return String(regulatoryStatusMap.vk[pcidss]);
  }),

  hipaaToString: computed("profile.reportPreference.show_hipaa", function() {
    const hipaa = this.get("profile.reportPreference.show_hipaa");
    return String(regulatoryStatusMap.vk[hipaa]);
  }),

  savePcidss: task(function *(status){
    yield this.get('saveReportPreference').perform({
      show_pcidss: regulatoryStatusMap.kv[status]
    });
  }).restartable(),

  saveHipaa: task(function *(status){
    yield this.get('saveReportPreference').perform({
      show_hipaa: regulatoryStatusMap.kv[status]
    });
  }).restartable(),

  saveReportPreference: task(function *(newPref) {
    const profile = this.get('profile');
    let pref = profile.get('reportPreference');
    yield profile.saveReportPreference({...pref, ...newPref});
  }).restartable(),
});
