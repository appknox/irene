import Controller from '@ember/controller';

export default class AuthenticatedStoreknoxDiscoverResultController extends Controller {
  queryParams = ['app_limit', 'app_offset'];

  app_limit = 10;
  app_offset = 0;
}
