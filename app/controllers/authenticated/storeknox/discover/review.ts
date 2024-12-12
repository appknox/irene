import Controller from '@ember/controller';

export default class AuthenticatedStoreknoxDiscoverReviewController extends Controller {
  queryParams = ['app_limit', 'app_offset', 'app_search_id', 'app_query'];

  app_limit = 10;
  app_offset = 0;
  app_search_id = null;
  app_query = '';
}
