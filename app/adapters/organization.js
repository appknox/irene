import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations`;
    return this.ajax(url, 'GET');
  },
  queryRecord: function queryRecord(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.id}`;
    return this.ajax(url, 'GET');
  }
});
