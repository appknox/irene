import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',

  _buildURL: function() {
    const baseURL = `${this.get('host')}/${this.get('namespace')}/mfa`;
    return baseURL;
  },
});
