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
    const baseURL = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/invitations`;
    if (id) {
      return `${baseURL}/${encodeURIComponent(id)}`;
    }
    return baseURL;
  },
  resend(store, type, snapshot) {
    let id = snapshot.id;
    const url = this.urlForResend(id, type.modelName, snapshot);
    return this.ajax(url, 'POST', { data: {} });
  },
  urlForResend(id, modelName) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, "resend"].join('/')
  }
});
