/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class OrganizationCleanupPreferenceAdapter extends commondrf {
  _buildURL() {
    return this.buildURLFromBase(`${this.get('namespace')}/organizations/${this.get('organization').selected.id}/cleanup-preference`);
  }
}
