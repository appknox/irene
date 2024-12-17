import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import styles from './index.scss';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsUnscannedVersionHeaderSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel | null;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionHeaderComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionHeaderSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked showSMDetails = false;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get skInventoryCoreProjectLatestVersion() {
    return this.args.skInventoryApp?.coreProjectLatestVersion;
  }

  get coreProjectLatestVersionId() {
    return this.skInventoryCoreProjectLatestVersion?.id;
  }

  get monitoringEnabled() {
    return this.skInventoryApp?.monitoringEnabled;
  }

  get lastSyncedDate() {
    return dayjs(this.skInventoryApp?.updatedOn).format('DD MMMM, YYYY');
  }

  get tabItems() {
    return [
      {
        id: 'monitoring-details',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.index',
        label: this.intl.t('appMonitoringModule.monitoringDetails'),
      },
      {
        id: 'monitoring-history',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.history',
        label: this.intl.t('appMonitoringModule.monitoringHistory'),
      },
    ];
  }

  get classes() {
    return { overviewSummary: styles['overview-summary'] };
  }

  @action handleToggleSMDetails() {
    this.showSMDetails = !this.showSMDetails;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::Header': typeof StoreknoxInventoryDetailsUnscannedVersionHeaderComponent;
  }
}
