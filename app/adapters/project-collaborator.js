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
  _buildURL(modelName, id) {
    const baseURL = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
    if (id) {
      return `${baseURL}/${encodeURIComponent(id)}`;
    }
    return baseURL;
  },
  _buildNestedURL(modelName, projectId, id) {
    const projectURL = this._buildURL(modelName, projectId);
    const collaboratorURL = [projectURL, 'collaborators'].join('/');
    if (id) {
      return `${collaboratorURL}/${encodeURIComponent(id)}`;
    }
    return collaboratorURL;
  },
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  },
  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId, query.id);
  },

  deleteCollaborator(store, type, snapshot, projectId) {
    const id = snapshot.id;
    const url = this.urlForQueryRecord({projectId, id}, type.modelName);
    return this.ajax(url, 'DELETE');
  },

  updateCollaborator(store, type, snapshot, projectId) {
    const id = snapshot.id;
    const data = {
      write: snapshot.get('write'),
    };
    const url = this.urlForQueryRecord({projectId, id}, type.modelName);
    return this.ajax(url, 'PUT', {data});
  },
});
