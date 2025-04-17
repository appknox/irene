import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedDashboardPrivacyModuleRoute extends Route {
  @service declare organization: OrganizationService;

  model() {
    const isPrivacyEnabled = this.organization.selected?.features?.privacy;

    return { isPrivacyEnabled };
  }
}
