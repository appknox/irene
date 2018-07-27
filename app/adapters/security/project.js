import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "hudson-api",
  addTrailingSlashes: false,
  query: function query(store, type, q) {
    let url = `${this.get('host')}/${this.get('namespace')}/projects?limit=${q.limit}&offset=${q.offset * 9}`;
    return this.ajax(url, 'GET');
  }
});
