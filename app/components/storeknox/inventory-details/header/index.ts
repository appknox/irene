import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import parseError from 'irene/utils/parse-error';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type MeService from 'irene/services/me';
import type SkOrganizationService from 'irene/services/sk-organization';

interface StoreknoxInventoryDetailsHeaderSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
    hideUploadToAppknoxBanner?: boolean;
    hideLicenseIcon?: boolean;
  };

  Blocks: {
    actionItems: [];
  };
}

export default class StoreknoxInventoryDetailsHeaderComponent extends Component<StoreknoxInventoryDetailsHeaderSignature> {
  @service declare intl: IntlService;
  @service declare me: MeService;

  @service('sk-organization') declare skOrg: SkOrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked isArchiveAppDrawerOpen = false;
  @tracked openToggleMonitoringDrawer = false;
  @tracked monitoringChecked = false;
  @tracked failedToLoadAppIcon = false;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsHeaderSignature['Args']
  ) {
    super(owner, args);

    this.monitoringChecked = args.skInventoryApp?.monitoringEnabled;

    // Reload org sub to get the latest org sub data
    this.skOrg.reloadOrgSub();
  }

  get displayFallbackAppIcon() {
    return (
      !this.skInventoryApp?.appMetadata.iconUrl || this.failedToLoadAppIcon
    );
  }

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get lastFakeAppDetectionDate() {
    return dayjs(this.skInventoryApp?.lastFakeDetectionOn).format(
      'MMM DD, YYYY'
    );
  }

  get appHasLicense() {
    return this.skInventoryApp?.hasLicense;
  }

  get showUploadToAppknoxBanner() {
    return (
      !this.args.hideUploadToAppknoxBanner &&
      this.skInventoryApp?.appIsNotAvailableOnAppknox
    );
  }

  get showLicenseAllocatedIcon() {
    return !this.args.hideLicenseIcon && this.appHasLicense;
  }

  get appCoreProjectLatestVersion() {
    return this.args.skInventoryApp?.coreProjectLatestVersion;
  }

  get archiveDateStringFromNow() {
    return dayjs().add(6, 'month').format('MMM D, YYYY');
  }

  get appTitle() {
    return this.skInventoryApp?.appMetadata.title;
  }

  get isOwnerOrAdmin() {
    return this.me.org?.is_owner || this.me.org?.is_admin;
  }

  @action
  handleAppLogoImageError() {
    this.failedToLoadAppIcon = true;
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
    if (!this.isOwnerOrAdmin) {
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
