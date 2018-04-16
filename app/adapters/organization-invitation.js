import DRFAdapter from './drf';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:irene',
  addTrailingSlashes: false,
  namespace: 'api',
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.id}/invitations`;
    return this.ajax(url, 'GET');
  }
});
