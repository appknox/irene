import Controller from '@ember/controller';

export default class AuthenticatedAppMonitoringController extends Controller {
  queryParams = ['app_limit', 'app_offset'];
  app_limit = 10;
  app_offset = 0;
}
