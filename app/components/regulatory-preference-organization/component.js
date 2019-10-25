import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  organization: null,

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
    const org = this.store.peekRecord('organization', this.get('organization.id'));
    let pref = org.get('reportPreference');
    yield org.saveReportPreference({...pref, ...newPref});
  }).restartable(),
});
