import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';
import type MeService from 'irene/services/me';
import type SkOrganizationService from 'irene/services/sk-organization';

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

  @service('sk-organization') declare skOrg: SkOrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked isArchiveAppDrawerOpen = false;
  @tracked openToggleMonitoringDrawer = false;
  @tracked monitoringChecked = false;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsHeaderSignature['Args']
  ) {
    super(owner, args);

    this.monitoringChecked = args.skInventoryApp?.monitoringEnabled;
  }

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get appHasLicense() {
    return this.skInventoryApp?.hasLicense;
  }

  get isOwnerOrAdmin() {
    const isOwner = this.me.org?.is_owner;
    const isAdmin = this.me.org?.is_admin;

    return isOwner || isAdmin;
  }

  get canToggleMonitoring() {
    return this.isOwnerOrAdmin;
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

  get disableMonitoringToggle() {
    return (
      !this.canToggleMonitoring || this.toggleSkInventoryAppMonitoring.isRunning
    );
  }

  get disableMonitoringTooltipText() {
    return this.intl.t('storeknox.cannotPerformStatusToggleText');
  }

  get activeRouteTagProps() {
    return this.routeTagList.find((t) => t.id === this.activeRouteTagId);
  }

  get archiveDateStringFromNow() {
    return dayjs().add(6, 'month').format('MMM D, YYYY');
  }

  get appTitle() {
    return this.skInventoryApp?.appMetadata.title;
  }

  get disableArchiving() {
    return (
      this.skInventoryApp?.isArchived && !this.skInventoryApp?.canUnarchive
    );
  }

  get showArchivedAppsInfoTagDivider() {
    return (
      !this.skInventoryApp.isArchived ||
      (this.skInventoryApp.isArchived && this.activeRouteTagProps)
    );
  }

  get showArchiveButton() {
    return this.isOwnerOrAdmin;
  }

  @action openArchiveAppDrawer() {
    this.isArchiveAppDrawerOpen = true;
  }

  @action closeArchiveAppDrawer() {
    this.isArchiveAppDrawerOpen = false;
  }

  @action closeToggleMonitoringDrawer() {
    this.openToggleMonitoringDrawer = false;
  }

  @action async onMonitoringActionToggle(_: Event, checked?: boolean) {
    if (!this.canToggleMonitoring) {
      return;
    }

    this.monitoringChecked = !!checked;

    // Perform toggle without drawer confirmation
    if (
      this.appHasLicense ||
      this.skOrg.selectedSkOrgSub?.isTrial ||
      this.skOrg.selectedSkOrgSub?.orgSubIsExpired ||
      // should allow to toggle off if app is already monitored but has no license
      // however, toggling back on would require a license to be allocated
      (this.skInventoryApp.monitoringEnabled && !this.appHasLicense)
    ) {
      this.confirmMonitoringToggle();

      return;
    }

    this.openToggleMonitoringDrawer = true;
  }

  @action cancelMonitoringToggle() {
    this.monitoringChecked = !this.monitoringChecked;
    this.openToggleMonitoringDrawer = false;
  }

  @action confirmMonitoringToggle() {
    this.toggleSkInventoryAppMonitoring.perform();
  }

  toggleSkInventoryAppMonitoring = task(async () => {
    try {
      await waitForPromise(
        this.skInventoryApp?.toggleMonitoring(this.monitoringChecked)
      );

      await this.skInventoryApp?.reload();

      this.notify.success(
        this.intl.t('storeknox.monitoring') +
          ` ${this.monitoringChecked ? this.intl.t('enabled') : this.intl.t('disabled')}`
      );

      // Reload org sub to update the licenses remaining count
      if (!this.appHasLicense) {
        await this.skOrg.reloadOrgSub();
      }
    } catch (error) {
      this.monitoringChecked = !this.monitoringChecked;

      this.skInventoryApp?.rollbackAttributes();
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::Header': typeof StoreknoxInventoryDetailsHeaderComponent;
  }
}
