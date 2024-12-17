import Controller from '@ember/controller';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkBreadcrumbsItemProps } from 'irene/services/ak-breadcrumbs';

export default class AuthenticatedStoreknoxAppListController extends Controller {
  @service declare intl: IntlService;

  get breadcrumbs(): AkBreadcrumbsItemProps {
    return {
      title: this.intl.t('storeknox.appInventory'),
      route: 'authenticated.storeknox.inventory.app-list',
      routeGroup: 'storeknox/inventory',
      stopCrumbGeneration: true,
      isRootCrumb: true,
    };
  }
}
