import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

const OrganizationService = Service.extend({
  selected: null,
  // host: ENV.host,
  // namespace: ENV.namespace,

  store: service('store'),
  // ajax: service('ajax'),
  notify: service('notification-messages'),

  async load() {
    const orgs = await this.get('store').findAll('organization');
    const selectedOrg = orgs.get('firstObject');
    if (selectedOrg) {
      // const url = `${this.get('host')}/${this.get('namespace')}/organizations/${selectedOrg.id}/me`;
      // const me = await this.get('ajax').request(url);
      // this.set('me', me);
      this.set('selected', selectedOrg);
    } else {
      this.get("notify").error(
        "Organization is missing Contact Support", ENV.notifications
      );
    }
  }
});

export default OrganizationService;
