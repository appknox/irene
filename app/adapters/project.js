/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationMember extends commondrf {
  _buildURL (modelName, id) {
    const baseurl = `${this.get('namespace_v2')}/projects`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/projects`);
  }
}
