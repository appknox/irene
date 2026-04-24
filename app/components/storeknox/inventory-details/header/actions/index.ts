import Component from '@glimmer/component';
import { service } from '@ember/service';

import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type MeService from 'irene/services/me';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

type RouteTagItem = {
  id: string;
  disabled: boolean;
  label: string;
  needsAction?: boolean;
  featureInProgress?: boolean;
  route: string;
  models: string[];
};

interface StoreknoxInventoryDetailsHeaderActionsSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
    toggleMonitoringIsRunning: boolean;
    monitoringChecked: boolean;
    onMonitoringActionToggle: (event: Event, checked?: boolean) => void;
    openArchiveAppDrawer: () => void;
  };
}

export default class StoreknoxInventoryDetailsHeaderActionsComponent extends Component<StoreknoxInventoryDetailsHeaderActionsSignature> {
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;

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
    }

    if (this.isMalwareDetectedRoute) {
      return 'malware-detected';
    }

    if (this.isUnscannedVersionRoute) {
      return 'unscanned-version';
    }

    return '';
  }

  get routeTagList(): RouteTagItem[] {
    const skInventoryAppId = this.skInventoryApp?.id as string;

    return [
      {
        id: 'unscanned-version',
        disabled: false,
        label: this.intl.t('storeknox.unscannedVersion'),
        needsAction: this.skInventoryApp?.storeMonitoringStatusIsActionNeeded,
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        models: [skInventoryAppId],
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

  get isOwnerOrAdmin(): boolean {
    return Boolean(this.me.org?.is_owner || this.me.org?.is_admin);
  }

  get canToggleMonitoring() {
    return this.isOwnerOrAdmin;
  }

  get disableMonitoringTooltipText() {
    return this.intl.t('storeknox.cannotPerformStatusToggleText');
  }

  get disableMonitoringToggle() {
    return !this.canToggleMonitoring || this.args.toggleMonitoringIsRunning;
  }

  get disableArchiving() {
    return (
      this.skInventoryApp?.isArchived && !this.skInventoryApp?.canUnarchive
    );
  }

  get showArchivedAppsInfoTagDivider() {
    if (!this.skInventoryApp.isArchived) {
      return true;
    }

    return Boolean(this.activeRouteTagProps);
  }

  get showArchiveButton() {
    return this.isOwnerOrAdmin;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header::Actions': typeof StoreknoxInventoryDetailsHeaderActionsComponent;
  }
}
