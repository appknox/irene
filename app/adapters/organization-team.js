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
    const baseurl = `${this.get('host')}/${this.get('namespace')}/organizations/${this.get('organization').selected.id}/teams`;
    if (id) {
      return `${baseurl}/${encodeURIComponent(id)}`;
    }
    return baseurl;
  },

  deleteMember(store, type, snapshot, member) {
    let id = snapshot.id;
    let memberId = member.id;
    const url = this.urlForDeleteMember(id, type.modelName, snapshot, memberId);
    return this.ajax(url, 'DELETE');
  },
  urlForDeleteMember(id, modelName, snapshot, memberId) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'members', memberId].join('/');
  },

  addMember(store, type, snapshot, data, memberId) {
    let id = snapshot.id;
    const url = this.urlForAddMember(id, type.modelName, snapshot, memberId);
    return this.ajax(url, 'PUT', {data});
  },
  urlForAddMember(id, modelName, snapshot, memberId) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'members', memberId].join('/');
  },

  addProject(store, type, snapshot, data, projectId) {
    let id = snapshot.id;
    const url = this.urlForAddProject(id, type.modelName, snapshot, projectId);
    return this.ajax(url, 'PUT', {data});
  },
  urlForAddProject(id, modelName, snapshot, projectId) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'projects', projectId].join('/');
  },

  createInvitation(store, type, snapshot, data) {
    let id = snapshot.id;
    const url = this.urlForCreateInvitation(id, type.modelName);
    return this.ajax(url, 'POST', {data});
  },
  urlForCreateInvitation(id, modelName) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, 'invitations'].join('/');
  },
});
