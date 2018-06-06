import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${query.orgId}/teams/${query.teamId}/invitations`;
    return this.ajax(url, 'GET');
  }
});
