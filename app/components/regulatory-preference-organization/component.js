import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend({
  organization: null,

  orgPreference: computed('store', function() {
    return this.get('store').queryRecord('organization-preference', {});
  }),

  savePcidss: task(function *(value){
    const pref = yield this.get('orgPreference');
    pref.set('reportPreference.show_pcidss', value);
    yield pref.save();
  }).restartable(),

  saveHipaa: task(function *(value){
    const pref = yield this.get('orgPreference');
    pref.set('reportPreference.show_hipaa', value);
    yield pref.save();
  }).restartable(),
});
