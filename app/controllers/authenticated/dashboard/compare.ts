import Controller from '@ember/controller';

export default class AuthenticatedDashboardCompare extends Controller {
  queryParams = [{ referrer: { type: 'string' as const } }];
}
