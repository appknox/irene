import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';

import Store from '@ember-data/store';
import OrganizationModel from 'irene/models/organization';

export default class OrganizationService extends Service {
  @service declare store: Store;
  @service declare notifications: NotificationService;

  selected: OrganizationModel | null = null;

  async load() {
    const orgs = await this.store.findAll('organization');
    const selectedOrg = orgs.map((_) => _)[0];

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
