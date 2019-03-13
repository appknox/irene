import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(DataAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  authorizer: 'authorizer:irene',
  organization: service('organization'),
  _buildURL(modelName, id) {
    const baseURL = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/teams`;
    if (id) {
      return `${baseURL}/${encodeURIComponent(id)}`;
    }
    return baseURL;
  },
  _buildNestedURL(modelName, teamId, id) {
    const teamURL = this._buildURL(modelName, teamId);
    const inviteURL = [teamURL, 'invitations'].join('/');
    if (id) {
      return `${inviteURL}/${encodeURIComponent(id)}`;
    }
    return inviteURL;
  },
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.teamId);
  },
});
