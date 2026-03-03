import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export default class AuthenticatedStoreknoxFakeAppsFakeAppDetailsIgnoredRoute extends AkBreadcrumbsRoute {
  model() {
    return this.modelFor('authenticated.storeknox.fake-apps.fake-app-details');
  }
}
