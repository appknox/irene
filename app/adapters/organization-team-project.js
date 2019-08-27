import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
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
    const projectURL = [teamURL, 'projects'].join('/');
    if (id) {
      return `${projectURL}/${encodeURIComponent(id)}`;
    }
    return projectURL;
  },

  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.teamId);
  },

  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.teamId, query.id);
  },

  deleteProject(store, type, snapshot, teamId) {
    const id = snapshot.id;
    const url = this.urlForQueryRecord({teamId, id}, type.modelName);
    return this.ajax(url, 'DELETE');
  },

  updateProject(store, type, snapshot, teamId) {
    const id = snapshot.id;
    const data = {
      write: snapshot.get('write'),
    };
    const url = this.urlForQueryRecord({teamId, id}, type.modelName);
    return this.ajax(url, 'PUT', {data});
  },
});
