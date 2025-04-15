import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationService from 'irene/services/organization';
import RouterService from '@ember/routing/router-service';

export default class AuthenticatedAdminSsoSettingsRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;
  @service declare router: RouterService;

  beforeModel() {
    if (!this.organization.selected?.features.public_apis) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }

  async model() {
    return {
      user: this.modelFor('authenticated') as UserModel,
      organization: this.organization.selected as OrganizationModel,
    };
  }
}
