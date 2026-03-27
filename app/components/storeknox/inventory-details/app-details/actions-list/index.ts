import Component from '@glimmer/component';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type OrganizationService from 'irene/services/organization';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
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

  get actionsList() {
    const { storeMonitoringStatusIsPending, fakeAppDetectionIsInitializing } =
      this.skInventoryApp || {};

    return [
      {
        id: 'unscanned-version',
        label: this.intl.t('storeknox.unscannedVersion'),
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        hideAction: false,
        needsAction: this.skInventoryApp?.storeMonitoringStatusIsActionNeeded,
        showDisabledState: !this.monitoringEnabled,
        statusIsInitializing: storeMonitoringStatusIsPending,

        disableActionButton:
          storeMonitoringStatusIsPending ||
          (!this.monitoringEnabled &&
            !this.skInventoryApp?.hasStoreMonitoringData),
      },
      {
        id: 'brand-abuse',
        label: this.intl.t('storeknox.fakeAppsTitle'),
        hideAction: false,
        route: 'authenticated.storeknox.fake-apps.fake-app-list.index',
        models: [this.skInventoryApp?.id],
        needsAction: this.skInventoryApp?.fakeAppDetectionHasResults,
        showDisabledState: !this.monitoringEnabled,
        statusIsInitializing: fakeAppDetectionIsInitializing,

        disableActionButton:
          fakeAppDetectionIsInitializing ||
          (!this.monitoringEnabled &&
            !this.skInventoryApp?.hasFakeAppDetectionData),
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
