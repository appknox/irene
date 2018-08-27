import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Ember from 'ember';
const {inject: {service}} = Ember;

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  organization: service('organization'),
  query: function query(store, type, query) {
    let url = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/teams/${query.teamId}/invitations`;
    return this.ajax(url, 'GET');
  }
});
