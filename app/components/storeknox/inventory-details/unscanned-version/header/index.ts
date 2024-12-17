import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import dayjs from 'dayjs';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import styles from './index.scss';
import type OrganizationService from 'irene/services/organization';
import type RouterService from '@ember/routing/router-service';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsUnscannedVersionHeaderSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel | null;
  };
}

export default class StoreknoxInventoryDetailsUnscannedVersionHeaderComponent extends Component<StoreknoxInventoryDetailsUnscannedVersionHeaderSignature> {
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @service declare organization: OrganizationService;
  @service declare store: Store;
  @service declare router: RouterService;

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

  @action onMonitoringActionToggle(_: Event, checked?: boolean) {
    this.toggleSkInventoryAppMonitoring.perform(!!checked);
  }

  toggleSkInventoryAppMonitoring = task(async (checked: boolean) => {
    try {
      this.skInventoryApp?.set('monitoringEnabled', checked);

      await this.skInventoryApp?.toggleMonitoring(checked);
      await this.skInventoryApp?.reload();

      this.notify.success(
        'Monitoring ' + `${checked ? 'Enabled' : 'Disabled'}`
      );
    } catch (error) {
      this.notify.error(parseError(error));

      this.skInventoryApp?.rollbackAttributes();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::UnscannedVersion::Header': typeof StoreknoxInventoryDetailsUnscannedVersionHeaderComponent;
  }
}
