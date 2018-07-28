import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "hudson-api",
  addTrailingSlashes: false,

  query: function query(store, type, q) {
    let url = `${this.get('host')}/${this.get('namespace')}/projects/${q.projectId}/files?limit=${q.limit}&offset=${q.offset * ENV.paginationMultiplier}`;
    return this.ajax(url, 'GET');
  },

  _buildURL: function _buildURL(modelName, id) {
    if(id) {
      return `${this.get('host')}/${this.get('namespace')}/files/${id}`;
    }
  }
});
