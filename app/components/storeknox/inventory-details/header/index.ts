import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import type WhitelabelService from 'irene/services/whitelabel';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsHeaderSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsHeaderComponent extends Component<StoreknoxInventoryDetailsHeaderSignature> {
  @service declare whitelabel: WhitelabelService;
  @service declare router: RouterService;
  @service declare intl: IntlService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
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

  get activeRouteTagId() {
    if (this.isBrandAbuseRoute) {
      return 'brand-abuse';
    } else if (this.isMalwareDetectedRoute) {
      return 'malware-detected';
    } else if (this.isUnscannedVersionRoute) {
      return 'unscanned-version';
    }

    return '';
  }

  get appCoreProjectLatestVersion() {
    return this.args.skInventoryApp?.coreProjectLatestVersion;
  }

  get routeTagList() {
    const skInventoryAppId = this.skInventoryApp?.id as string;
    const appCoreProjectLatestVersionId = this.appCoreProjectLatestVersion?.id;

    return [
      {
        id: 'unscanned-version',
        disabled: false,
        label: this.intl.t('storeknox.unscannedVersion'),
        needsAction:
          this.skInventoryApp?.storeMonitoringStatus ===
          ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        models: [skInventoryAppId, appCoreProjectLatestVersionId as string],
      },
      {
        id: 'brand-abuse',
        disabled: false,
        label: this.intl.t('storeknox.brandAbuse'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.brand-abuse',
        models: [skInventoryAppId],
      },
      {
        id: 'malware-detected',
        disabled: false,
        label: this.intl.t('storeknox.malwareDetected'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.malware-detected',
        models: [skInventoryAppId],
      },
    ];
  }

  get activeRouteTagProps() {
    return this.routeTagList.find((t) => t.id === this.activeRouteTagId);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header': typeof StoreknoxInventoryDetailsHeaderComponent;
  }
}
