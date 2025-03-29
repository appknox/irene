import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

export default class AuthenticatedReportsGenerateRoute extends Route {
  @service declare router: RouterService;

  // The model hook resets with each visit
  model() {
    return {};
  }

  // Reset controller state
  resetController(controller: any, isExiting: boolean) {
    if (isExiting) {
      // We're leaving the route, reset the controller
      controller.set('reportDescription', '');
      controller.set('selectedCategory', 'general');
    }
  }
}
