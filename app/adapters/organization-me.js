import commondrf from './commondrf';

export default class OrganizationME extends commondrf {
  _buildURL () {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/me`);
  }
}
