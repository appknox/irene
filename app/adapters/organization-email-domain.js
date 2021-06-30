import commondrf from './commondrf';

export default class OrganizationEmailDomainAdapter extends commondrf {
  _buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.namespace}/organizations/${this.organization.selected.id}/email_domains${id ? '/' + id : ''}`);
  }
}
