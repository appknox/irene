import Component from '@glimmer/component';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsActionsListSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsActionsListComponent extends Component<StoreknoxInventoryDetailsAppDetailsActionsListSignature> {
  @service declare intl: IntlService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get actionsList() {
    return [
      {
        id: 'unscanned-version',
        label: this.intl.t('storeknox.unscannedVersion'),
        route: 'authenticated.storeknox.inventory-details.unscanned-version',
        needsAction:
          this.skInventoryApp?.storeMonitoringStatus ===
          ENUMS.SK_APP_MONITORING_STATUS.UNSCANNED,
      },
      {
        id: 'brand-abuse',
        label: this.intl.t('storeknox.brandAbuse'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.brand-abuse',
      },
      {
        id: 'malware-detected',
        label: this.intl.t('storeknox.malwareDetected'),
        featureInProgress: true,
        route: 'authenticated.storeknox.inventory-details.malware-detected',
      },
    ];
  }

  get actionableItemsCount() {
    return this.actionsList.reduce(
      (count, action) => (action.needsAction ? count + 1 : count),
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
