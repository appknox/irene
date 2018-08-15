import Ember from 'ember';
import ENV from 'irene/config/environment';

const OrganizationService = Ember.Service.extend({
  selected: null,
  store: Ember.inject.service('store'),
  notify: Ember.inject.service('notification-messages'),
  async load() {
    const orgs = await this.get('store').findAll('organization');
    const selectedOrg = orgs.get('firstObject');
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
