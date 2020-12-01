import commondrf from './commondrf';

export default class OrganizationCleanupAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/cleanups`);
  }
}
