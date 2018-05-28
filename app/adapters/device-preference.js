import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  urlForQueryRecord: function (query, modelName) {
    let url = `${this.host}/${this.get('namespace')}/profiles/${query.id}/device_preference`;
    return url;
  }
});
