import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

export default class OrganizationService extends Service {
  selected = null;
  @service store;
  @service notifications;

  async load() {
    const orgs = await this.store.findAll('organization');
    const selectedOrg = orgs.get('firstObject');
    if (selectedOrg) {
      this.selected = selectedOrg;
    } else {
      this.notifications.error(
        'Organization is missing Contact Support',
        ENV.notifications
      );
    }
  }
}
