import commondrf from './commondrf';

export default class OrganizationNamespace extends commondrf {
  _buildURL(modelName, id) {
    const namespace = this.namespace;
    const orgId = this.organization.selected.id;
    const baseurl = `${namespace}/organizations/${orgId}/namespaces`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
