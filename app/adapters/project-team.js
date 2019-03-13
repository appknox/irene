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
    const baseURL = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
    if (id) {
      return `${baseURL}/${encodeURIComponent(id)}`;
    }
    return baseURL;
  },
  _buildNestedURL(modelName, projectId, id) {
    const projectURL = this._buildURL(modelName, projectId);
    const teamURL = [projectURL, 'teams'].join('/');
    if (id) {
      return `${teamURL}/${encodeURIComponent(id)}`;
    }
    return teamURL;
  },
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  },
  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  },
});
