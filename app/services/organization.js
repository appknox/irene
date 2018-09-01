import Ember from 'ember';
import ENV from 'irene/config/environment';

const OrganizationService = Ember.Service.extend({
  selected: null,
  // host: ENV.host,
  // namespace: ENV.namespace,

  store: Ember.inject.service('store'),
  // ajax: Ember.inject.service('ajax'),
  notify: Ember.inject.service('notification-messages'),

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
