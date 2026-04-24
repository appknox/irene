import Component from '@glimmer/component';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type SkOrganizationService from 'irene/services/sk-organization';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: { skInventoryApp?: SkInventoryAppModel };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare skOrganization: SkOrganizationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get orgHasFakeAppDetectionFeature() {
    return this.skOrganization.selected?.skFeatures.fake_app_detection;
  }

  get storeMonitoringStatus() {
    return this.skInventoryApp?.storeMonitoringStatus;
  }

  get monitoringEnabled() {
    return this.skInventoryApp?.monitoringEnabled;
  }

  get showActionableItemsCount() {
    return this.actionableItemsCount > 0 && this.monitoringEnabled;
  }

  get storeMonitoringStatusIsPending() {
    return this.skInventoryApp?.storeMonitoringStatusIsPending;
  }

  get fakeAppDetectionIsInitializing() {
    return this.skInventoryApp?.fakeAppDetectionIsInitializing;
  }

  get actionsList() {
    return [
      {
        id: 'unscanned-version',
        label: this.intl.t('storeknox.unscannedVersion'),
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        hideAction: false,
        needsAction: this.skInventoryApp?.storeMonitoringStatusIsActionNeeded,
        showDisabledState: !this.monitoringEnabled,
        statusIsInitializing: this.storeMonitoringStatusIsPending,

        disableActionButton:
          this.storeMonitoringStatusIsPending ||
          (!this.monitoringEnabled &&
            !this.skInventoryApp?.hasStoreMonitoringData),

        shouldShowDisabledTooltip:
          this.storeMonitoringStatusIsPending ||
          (!this.monitoringEnabled &&
            !this.skInventoryApp?.hasStoreMonitoringData),

        disabledTooltipMessage: this.storeMonitoringStatusIsPending
          ? this.intl.t('storeknox.initializingMsg')
          : this.intl.t('storeknox.noStoreMonitoringDataTooltip'),
      },
      this.orgHasFakeAppDetectionFeature
        ? {
            id: 'brand-abuse',
            label: this.intl.t('storeknox.fakeAppsTitle'),
            hideAction: false,
            route: 'authenticated.storeknox.fake-apps.fake-app-list.index',
            models: [this.skInventoryApp?.id],
            needsAction: this.skInventoryApp?.fakeAppDetectionHasResults,
            showDisabledState: !this.monitoringEnabled,
            statusIsInitializing: this.fakeAppDetectionIsInitializing,

            disableActionButton:
              this.fakeAppDetectionIsInitializing ||
              (!this.monitoringEnabled &&
                !this.skInventoryApp?.hasFakeAppDetectionData),

            shouldShowDisabledTooltip:
              this.fakeAppDetectionIsInitializing ||
              (!this.monitoringEnabled &&
                !this.skInventoryApp?.hasFakeAppDetectionData),

            disabledTooltipMessage: this.fakeAppDetectionIsInitializing
              ? this.intl.t('storeknox.initializingMsg')
              : this.intl.t('storeknox.noFakeAppDetectionDataTooltip'),
          }
        : {
            id: 'brand-abuse',
            label: this.intl.t('storeknox.fakeAppsTitle'),
            featureInProgress: true,
            route: 'authenticated.storeknox.inventory-details.brand-abuse',
            hideAction: this.organization.hideUpsellUI,
          },
      {
        id: 'malware-detected',
        label: this.intl.t('storeknox.malwareDetected'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.malware-detected',
        hideAction: this.organization.hideUpsellUI,
      },
    ];
  }

  get actionableItemsCount() {
    return this.actionsList.reduce(
      (count, action) =>
        action.needsAction && !action.showDisabledState ? count + 1 : count,
      0
    );
  }

  get lastMonitoredDate() {
    return dayjs(this.skInventoryApp?.lastMonitoredOn).format('MMM DD, YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList': typeof StoreknoxInventoryDetailsAppDetailsActionsListComponent;
  }
}
