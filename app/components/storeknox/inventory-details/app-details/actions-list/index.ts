import Component from '@glimmer/component';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: {
    app?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  @service declare intl: IntlService;

  get skInventoryApp() {
    return this.args.app;
  }

  get actionsList() {
    const skInventoryAppId = this.skInventoryApp?.id as string;

    return [
      {
        id: 'unscanned-version',
        disabled: false,
        label: this.intl.t('storeknox.unscannedVersion'),
        needsAction:
          this.skInventoryApp?.storeMonitoringStatus ===
          ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        model: skInventoryAppId,
      },
      {
        id: 'brand-abuse',
        disabled: false,
        label: this.intl.t('storeknox.brandAbuse'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.brand-abuse',
        model: skInventoryAppId,
      },
      {
        id: 'malware-detected',
        disabled: false,
        label: this.intl.t('storeknox.malwareDetected'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.malware-detected',
        model: skInventoryAppId,
      },
    ];
  }

  get actionableItemsCount() {
    return this.actionsList.reduce(
      (count, action) => (action.needsAction ? count + 1 : count + 0),
      0
    );
  }

  get lastMonitoredDate() {
    return dayjs(this.skInventoryApp?.updatedOn).format('MMM DD, YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::ActionsList': typeof StoreknoxInventoryDetailsAppDetailsActionsListComponent;
  }
}
