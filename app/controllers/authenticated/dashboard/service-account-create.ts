import Controller from '@ember/controller';

export default class AuthenticatedDashboardServiceAccountCreateController extends Controller {
  queryParams = ['duplicate'];

  duplicate = null;
}
