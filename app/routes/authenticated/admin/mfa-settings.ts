import { service } from '@ember/service';
import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import type UserModel from 'irene/models/user';
import type OrganizationModel from 'irene/models/organization';
import type OrganizationService from 'irene/services/organization';

export default class AuthenticatedAdminMfaSettingsRoute extends AkBreadcrumbsRoute {
  @service declare organization: OrganizationService;

  async model() {
    return {
      user: this.modelFor('authenticated') as UserModel,
      organization: this.organization.selected as OrganizationModel,
    };
  }
}
