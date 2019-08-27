import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  namespace_v2: ENV.namespace_v2,
  addTrailingSlashes: false,
  _buildURL: function (modelName, id) {
    if(id) {
      const baseurl = `${this.get('host')}/${this.get('namespace_v2')}/analyses`;
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
  },
  _buildNestedURL(modelName, fileId) {
    const baseURL = `${this.get('host')}/${this.get('namespace_v2')}/files/${fileId}`;
    const url = [baseURL, 'analyses'].join('/');
    return url;
  },
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.fileId);
  },
});
