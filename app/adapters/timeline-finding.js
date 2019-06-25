import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
export default DRFAdapter.extend(DataAdapterMixin, {
    host: ENV.host,
    namespace: ENV.namespace,
    namespace_v2: ENV.namespace_v2,
    addTrailingSlashes: false,
    authorizer: 'authorizer:irene',

     buildURL(modelName, id) {
        if (id){
          let baseurl = `${this.get('host')}/${this.get('namespace')}/findings`;
          return `${baseurl}/${encodeURIComponent(id)}`
        }
        return ""
      }
});
