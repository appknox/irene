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

  get coreProjectLatestVersion() {
    return this.args.skInventoryApp?.coreProjectLatestVersion;
  }

  get coreProjectLatestVersionId() {
    return this.coreProjectLatestVersion?.get('id');
  }

  get monitoringEnabled() {
    return this.skInventoryApp?.monitoringEnabled;
  }

  get lastMonitoredOn() {
    return dayjs(this.skInventoryApp?.lastMonitoredOn).format('DD MMMM, YYYY');
  }

  get tabItems() {
    return [
      {
        id: 'monitoring-details',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.index',
        label: this.intl.t('storeknox.monitoringDetails'),
      },
      {
        id: 'monitoring-history',
        route:
          'authenticated.storeknox.inventory-details.unscanned-version.history',
        label: this.intl.t('storeknox.monitoringHistory'),
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
