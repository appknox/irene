import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { task } from 'ember-concurrency';
import ENV from 'irene/config/environment';
import PaginateMixin from 'irene/mixins/paginate';

export default Component.extend(PaginateMixin, {
  selectedCount: 0,

  targetModel: 'capturedapi',
  sortProperties: ['id:asc'],

  extraQueryStrings: computed('file.id', function() {
    const query ={fileId: this.get('file.id')};
    return JSON.stringify(query, Object.keys(query).sort());
  }),

  newCapturedApiCounterObserver: observer('realtime.CapturedApiCounter', function() {
    this.get('setSelectedCount').perform();
    return this.incrementProperty('version');
  }),

  didInsertElement() {
this._super(...arguments);
    this.get('setSelectedCount').perform();
  },

  getSelectedApis: task(function * () {
    let data = {fileId: this.get('file.id'), is_active: true};
    const url = [ENV.endpoints.files, this.get('file.id'), 'capturedapis'].join('/');
    return yield this.get('ajax').request(url, {namespace: ENV.namespace_v2, data});
  }),

  setSelectedCount: task(function * () {
    try {
      let selectedApis = yield this.get('getSelectedApis').perform();
      yield this.set('selectedCount', selectedApis.count);
    } catch(error) {
      this.get('notify').error(error.toString());
    }
  }),

  toggleApi: task(function * (capturedApi, isActive){
    yield capturedApi.set('isActive', !(isActive));
    yield capturedApi.save();
    yield this.get('setSelectedCount').perform();
  }),
});
