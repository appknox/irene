import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,

  _buildURL(modelName, id) {
    const baseURL = `${this.get('host')}/${this.get('namespace')}/projects`;
    if (id) {
      return `${baseURL}/${encodeURIComponent(id)}`;
    }
    return baseURL;
  },

  _buildNestedURL(modelName, projectId) {
    const projectURL = this._buildURL(modelName, projectId);
    const availableDevicesURL = [projectURL, 'available-devices'].join('/');
    return availableDevicesURL;
  },

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  },

});
