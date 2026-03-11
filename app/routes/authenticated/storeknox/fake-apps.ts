import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';

export interface StoreknoxFakeAppsParams {
  sk_app: string;
}

export default class AuthenticatedStoreknoxFakeAppsRoute extends AkBreadcrumbsRoute {
  model(params: StoreknoxFakeAppsParams) {
    return { sk_app_id: params.sk_app };
  }
}
