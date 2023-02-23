import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import Store from '@ember-data/store';
import OrganizationModel from '../models/organization';
import { tracked } from '@glimmer/tracking';

export default class OrganizationService extends Service {
  @service declare store: Store;
  @service declare notifications: NotificationService;

  @tracked selected: OrganizationModel | null = null;

  get selectedOrgProjectsCount() {
    if (this.selected) {
      return this.selected.projectsCount;
    }

    return 0;
  }

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
