import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,

  async saveReportPreference(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/report_preference';
    await this.ajax(url, 'PUT', { data: data });
    return this.store.findRecord('profile', modelId);
  },
  async setShowPcidss(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';
    await this.ajax(url, 'PUT', {data});
    return this.store.findRecord('profile', modelId);
  },
  async unsetShowPcidss(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  },
  async setShowHipaa(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';
    await this.ajax(url, 'PUT', {data});
    return this.store.findRecord('profile', modelId);
  },
  async unsetShowHipaa(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
});
