import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedOrganizationSettingsRoute extends AkBreadcrumbsRoute {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel(): void {
    if (!this.me.org?.get('is_admin')) {
      this.router.transitionTo(
        'authenticated.dashboard.organization.namespaces'
      );
    }
  }

  async model() {
    return {
      user: this.modelFor('authenticated') as UserModel,
      organization: this.organization.selected as OrganizationModel,
    };
  }
}
