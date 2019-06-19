import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  buildURL(modelName, id, snapshot, requestType) {
    let url = `${this.host}/${this.get('namespace')}/profiles/${id}/proxy_settings`;
    return url;
  }
});
