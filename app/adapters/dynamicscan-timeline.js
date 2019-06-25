import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  namespace_v2: ENV.namespace_v2,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',

   _buildURL(modelName, id, query) {
      if (id){
        let baseurl = `${this.get('host')}/${this.get('namespace')}/timelines`;
        return `${baseurl}/${encodeURIComponent(id)}`
      }
      let baseurl = `${this.get('host')}/${this.get('namespace')}/dynamicscans/${query.dynamicscanId}`;
      return `${baseurl}/timelines`
    },
    urlForQuery: function urlForQuery(query, modelName) {
        return this._buildURL(modelName, null, query);
    },
}); 