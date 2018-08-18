import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.id}/invitations`;
    let queryParams = Object.assign({}, query);
    delete queryParams.id;
    return this.ajax(url, 'GET', {data: queryParams});
  },
  queryRecord: function(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.orgId}/invitations/${query.id}`;
    return this.ajax(url, 'GET');
  },
  deleteRecord: function(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.record.get('organization.id')}/invitations/${query.record.get('id')}`;
    return this.ajax(url, 'DELETE');
  },
});
