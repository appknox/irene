import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';
import type MeService from 'irene/services/me';

interface StoreknoxInventoryDetailsHeaderSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsHeaderComponent extends Component<StoreknoxInventoryDetailsHeaderSignature> {
  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service('notifications') declare notify: NotificationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get canToggleMonitoring() {
    const isOwner = this.me.org?.is_owner;
    const isAdmin = this.me.org?.is_admin;

    return isOwner || isAdmin;
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

    return [
      {
        id: 'unscanned-version',
        disabled: false,
        label: this.intl.t('storeknox.unscannedVersion'),
        needsAction: this.skInventoryApp?.containsUnscannedVersion,
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

  @action onMonitoringActionToggle(_: Event, checked?: boolean) {
    if (this.canToggleMonitoring) {
      this.toggleSkInventoryAppMonitoring.perform(!!checked);
    }
  }

  toggleSkInventoryAppMonitoring = task(async (checked: boolean) => {
    try {
      await this.skInventoryApp?.toggleMonitoring(checked);
      await this.skInventoryApp?.reload();

      this.notify.success(
        this.intl.t('storeknox.monitoring') +
          ` ${checked ? this.intl.t('enabled') : this.intl.t('disabled')}`
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header': typeof StoreknoxInventoryDetailsHeaderComponent;
  }
}
