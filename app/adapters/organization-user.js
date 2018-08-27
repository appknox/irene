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
  _buildURL: function(modelName, id) {
    const baseurl = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/users`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },
});
