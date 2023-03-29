import Controller from '@ember/controller';
import { AppMonitoringRouteModel } from 'irene/routes/authenticated/dashboard/app-monitoring';

export default class AuthenticatedDashboardAppMonitoringIndexController extends Controller {
  declare model: AppMonitoringRouteModel;

  queryParams = ['app_limit', 'app_offset'];

  app_limit = 10;
  app_offset = 0;
}
