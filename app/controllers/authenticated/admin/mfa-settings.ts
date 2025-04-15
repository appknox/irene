import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type OrganizationModel from 'irene/models/organization';
import type UserModel from 'irene/models/user';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedAdminMfaSettingsController extends Controller {
  @service declare intl: IntlService;

  declare model: {
    user: UserModel;
    organization: OrganizationModel;
  };

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('adminMFASettings'),
      route: 'authenticated.admin.mfa-settings-settings',
      routeGroup: 'admin',
    };
  }
}
