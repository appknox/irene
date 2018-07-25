import ENV from 'irene/config/environment';
import DRFAdapter from 'irene/adapters/drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  host: ENV.host,
  namespace: "hudson-api",
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/projects?limit=${query.limit}&offset=${query.offset}&query=${query.query}`;
    return this.ajax(url, 'GET');
  }
});
