import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';

export default class AuthenticatedAdminRoute extends Route {
  @service declare router: RouterService;
  @service declare me: MeService;

  beforeModel() {
    if (!this.me.org?.get('is_admin') || !this.me.org?.get('is_owner')) {
      this.router.transitionTo('authenticated.dashboard.projects');
    }
  }
}
