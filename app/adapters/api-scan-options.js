import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  urlForQueryRecord: function (q) {
    let url = `${this.host}/${this.get('namespace')}/profiles/${q.id}/api_scan_options`;
    return url;
  }
});
