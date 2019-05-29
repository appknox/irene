import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  async saveReportPreference(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/report_preference';
    await this.ajax(url, 'PUT', { data: data });
    return this.store.findRecord('profile', modelId);
  }
});
