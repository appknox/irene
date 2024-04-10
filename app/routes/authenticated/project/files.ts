import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

export default class AuthenticatedProjectFilesRoute extends Route {
  @service declare router: RouterService;

  beforeModel() {
    const params = this.paramsFor('authenticated.project') as Record<
      string,
      string
    >;

    if (params) {
      this.router.transitionTo(
        'authenticated.dashboard.project.files',
        params['projectid'] as string
      );
    }
  }
}
