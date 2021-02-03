import Service from '@ember/service';
import {
  inject as service
} from '@ember/service';
import ENV from 'irene/config/environment';

const OrganizationService = Service.extend({
  selected: null,

  store: service('store'),
  notify: service('notifications'),

  async load() {
    const orgs = await this.get('store').findAll('organization');
    console.log('orgs', orgs)
    const selectedOrg = orgs.get('firstObject');
    console.log('selectedOrg', selectedOrg)
    if (selectedOrg) {
      this.set('selected', selectedOrg);
    } else {
      this.get("notify").error(
        "Organization is missing Contact Support", ENV.notifications
      );
    }
  }
});

export default OrganizationService;
