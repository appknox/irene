import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxInventoryPendingReviewsController extends Controller {
  @service declare intl: IntlService;
  queryParams = ['app_limit', 'app_offset', 'app_search_id', 'app_query'];

  app_limit = 10;
  app_offset = 0;
  app_search_id = null;
  app_query = '';

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('testCase'),
      route: 'authenticated.storeknox.inventory.pending-reviews',
      routeGroup: 'storeknox/inventory',

      parentCrumb: {
        title: this.intl.t('storeknox.appInventory'),
        routeGroup: 'storeknox/inventory',
        route: 'authenticated.storeknox.inventory.app-list',
      },
    };
  }
}
