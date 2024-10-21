import Controller from '@ember/controller';

export default class AuthenticatedDashboardFileAnalysisCompare extends Controller {
  queryParams = [{ referrer: { type: 'string' as const } }];
}
