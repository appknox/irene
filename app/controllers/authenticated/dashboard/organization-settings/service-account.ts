import Controller from '@ember/controller';

export default class AuthenticatedDashboardOrganizationSettingsServiceAccountController extends Controller {
  queryParams = ['sa_limit', 'sa_offset', 'show_system_created'];

  sa_limit = 10;
  sa_offset = 0;
  show_system_created = false;
}
