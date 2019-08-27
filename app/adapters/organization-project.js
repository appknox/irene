import DRFAdapter from './drf';
import ENV from 'irene/config/environment';
import IreneAdapterMixin from 'irene/mixins/data-adapter-mixin';
import { inject as service } from '@ember/service';

export default DRFAdapter.extend(IreneAdapterMixin, {
  host: ENV.host,
  namespace: ENV.namespace,
  addTrailingSlashes: false,
  organization: service('organization'),
  _buildURL: function(modelName, id) {
    const baseurl = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },

  addCollaborator(store, type, snapshot, data, collaboratorId) {
    let id = snapshot.id;
    const url = this.urlForAddCollaborator(id, type.modelName, snapshot, collaboratorId);
    return this.ajax(url, 'PUT', {data});
  },
  urlForAddCollaborator(id, modelName, snapshot, collaboratorId) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'collaborators', collaboratorId].join('/');
  },
});
