/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods, prettier/prettier */
import commondrf from './commondrf';

export default class OrganizationMember extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/members`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
