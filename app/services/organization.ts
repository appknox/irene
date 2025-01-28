import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';

import ENV from 'irene/config/environment';
import type OrganizationModel from 'irene/models/organization';
import type IreneAjaxService from './ajax';

export default class OrganizationService extends Service {
  @service declare store: Store;
  @service declare notifications: NotificationService;
  @service declare ajax: IreneAjaxService;

  @tracked selected: OrganizationModel | null = null;
  @tracked isSecurityEnabled = false;

  get selectedOrgProjectsCount() {
    if (this.selected) {
      return this.selected.projectsCount;
    }

    return 0;
  }

  async setSecurityDashboardEnabled() {
    try {
      await this.ajax.request('projects', { namespace: 'api/hudson-api' });

      this.isSecurityEnabled = true;
    } catch (error) {
      this.isSecurityEnabled = false;
    }
  }

  async fetchOrganization() {
    const organizations = await this.store.findAll('organization');
    const selectedOrg = organizations.slice()[0];

    if (selectedOrg) {
      this.selected = selectedOrg;
    } else {
      this.notifications.error(
        'Organization is missing Contact Support',
        ENV.notifications
      );
    }
  }

  /**
   * Loads Organization and check if security dashboard is enabled
   */
  async load() {
    await this.fetchOrganization();
    await this.setSecurityDashboardEnabled();
  }
}
