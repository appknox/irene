import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type WhitelabelService from 'irene/services/whitelabel';
import SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryDetailsHeaderSignature {
  Args: {
    skApp: SkAppModel;
  };
}

export default class StoreknoxInventoryDetailsHeaderComponent extends Component<StoreknoxInventoryDetailsHeaderSignature> {
  @service declare whitelabel: WhitelabelService;
  @service declare router: RouterService;

  get skApp() {
    return this.args.skApp;
  }

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
        route: 'authenticated.storeknox.inventory.app-list',
        linkTitle: 'Inventory',
      },
      {
        route: 'authenticated.storeknox.inventory-details.index',
        linkTitle: 'Inventory Details',
        models: [this.skApp.id],
      },

      this.isBrandAbuseRoute
        ? {
            route: 'authenticated.storeknox.inventory-details.brand-abuse',
            linkTitle: 'Brand Abuse',
            models: [this.skApp.id],
          }
        : null,

      this.isMalwareDetectedRoute
        ? {
            route: 'authenticated.storeknox.inventory-details.malware-detected',
            linkTitle: 'Malware Detected',
            models: [this.skApp.id],
          }
        : null,

      this.isUnscannedVersionRoute
        ? {
            route:
              'authenticated.storeknox.inventory-details.unscanned-version.index',
            linkTitle: 'Unscanned Version',
            models: [this.skApp.id, '3257'],
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
