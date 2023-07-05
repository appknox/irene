import Route from '@ember/routing/route';

export default class AuthenticatedDashboardFileRoute extends Route {
  activate() {
    window.scrollTo(0, 0);
  }
}
