import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';

export default class AuthenticatedReportsRoute extends Route {
  @service declare router: RouterService;
  @service declare me: MeService;

  model() {
    return this.me.user;
  }

  // Optional logic can be added here if needed
  // For example, to check if the user has access to reports
  // or to redirect to a specific sub-route
}
