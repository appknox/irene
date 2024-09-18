import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import WhitelabelService from 'irene/services/whitelabel';
import RouterService from '@ember/routing/router-service';

export default class StoreknoxInventoryDetailsHeaderComponent extends Component {
  @service declare whitelabel: WhitelabelService;
  @service declare router: RouterService;

  get routeLocalName() {
    return this.router.currentRoute.name;
  }

  get isBrandAbuseRoute() {
    return this.routeLocalName.includes('brand-abuse');
  }

  get isMalwareDetectedRoute() {
    return this.routeLocalName.includes('malware-detected');
  }

  get isUnscannedVersionRoute() {
    return this.routeLocalName.includes('unscanned-version');
  }

  get activeRouteTag() {
    if (this.isBrandAbuseRoute) {
      return 'Brand Abuse';
    } else if (this.isMalwareDetectedRoute) {
      return 'Malware Detected';
    } else if (this.isUnscannedVersionRoute) {
      return 'Unscanned Version';
    }

    return '';
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.dashboard.storeknox',
        linkTitle: 'Home',
      },
      {
        route: 'authenticated.dashboard.storeknox.inventory',
        linkTitle: 'Inventory',
      },
      {
        route: 'authenticated.dashboard.storeknox.inventory.inventory-details',
        linkTitle: 'Inventory Details',
        model: ['3257'],
      },

      this.isBrandAbuseRoute
        ? {
            route: 'authenticated.dashboard.storeknox.inventory.brand-abuse',
            linkTitle: 'Brand Abuse',
            model: ['3257'],
          }
        : null,

      this.isMalwareDetectedRoute
        ? {
            route:
              'authenticated.dashboard.storeknox.inventory.malware-detected',
            linkTitle: 'Malware Detected',
            model: ['3257'],
          }
        : null,

      this.isUnscannedVersionRoute
        ? {
            route:
              'authenticated.dashboard.storeknox.inventory.unscanned-version.index',
            linkTitle: 'Unscanned Version',
            model: ['3257', '3257'],
          }
        : null,
    ].filter(Boolean);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header': typeof StoreknoxInventoryDetailsHeaderComponent;
  }
}
