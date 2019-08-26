import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  _buildURL: function (modelName, id) {
    const baseurl = `${this.get('host')}/${this.get('namespace')}/projects/${id}/github`;
    return baseurl;
  },
  urlForCreateRecord: function(modelName, snapshot) {
    return this._buildURL(modelName, snapshot.id, snapshot);
  }
});
