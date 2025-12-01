import Controller from '@ember/controller';
import type { CompareRouteModel } from 'irene/routes/authenticated/dashboard/compare';

export default class AuthenticatedDashboardCompareController extends Controller {
  declare model: CompareRouteModel;
}
