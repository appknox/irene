import { service } from '@ember/service';
import Component from '@glimmer/component';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type SkOrganizationService from 'irene/services/sk-organization';

interface StoreknoxInventoryDetailsAppDetailsSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component<StoreknoxInventoryDetailsAppDetailsSignature> {
  @service declare skOrganization: SkOrganizationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get orgHasFakeAppDetectionFeature() {
    return this.skOrganization.selected?.skFeatures.fake_app_detection;
  }

  get onlyStoreMonitoringIsDisabledWithNoResults() {
    return (
      !this.skInventoryApp?.monitoringEnabled &&
      !this.skInventoryApp?.hasStoreMonitoringData
    );
  }

  get showMonitoringPendingInfo() {
    if (!this.orgHasFakeAppDetectionFeature) {
      return this.skInventoryApp?.storeMonitoringStatusIsPending;
    }

    return (
      this.skInventoryApp?.fakeAppDetectionIsInitializing &&
      this.skInventoryApp?.storeMonitoringStatusIsPending
    );
  }

  get showMonitoringPendingOrDisabledInfo() {
    if (!this.orgHasFakeAppDetectionFeature) {
      return (
        this.showMonitoringPendingInfo ||
        this.onlyStoreMonitoringIsDisabledWithNoResults
      );
    }

    return (
      this.showMonitoringPendingInfo ||
      this.skInventoryApp.monitoringIsDisabledWithNoResults
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
