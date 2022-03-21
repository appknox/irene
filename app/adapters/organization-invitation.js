/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationInvitation extends commondrf {

  _buildURL(modelName, id) {
    const baseURL = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/invitations`;
    if (id) {
      return this.buildURLFromBase(`${baseURL}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseURL);
  }

  resend(store, type, snapshot) {
    let id = snapshot.id;
    const url = this.urlForResend(id, type.modelName, snapshot);
    return this.ajax(url, 'POST', {
      data: {}
    });
  }

  urlForResend(id, modelName) {
    const baseURL = this._buildURL(modelName, id);
    return [baseURL, "resend"].join('/')
  }
}
