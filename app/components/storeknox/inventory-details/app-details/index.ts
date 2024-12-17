import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component<StoreknoxInventoryDetailsAppDetailsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get skInventoryCoreProjectLatestVersion() {
    return this.skInventoryApp?.coreProject?.latestVersion;
  }

  get appDetailsInfo() {
    return [
      {
        title: this.intl.t('storeknox.developer'),
        value: this.skInventoryApp?.devName,
      },
      {
        title: this.intl.t('emailId'),
        value: this.skInventoryApp?.devEmail,
      },
      {
        title: this.intl.t('storeknox.addedToInventoryOn'),
        value: dayjs(this.skInventoryApp?.addedOn).format('DD, MMM YYYY'),
      },
    ];
  }

  get vaResultsData() {
    return [
      {
        title: 'Version',
        value: this.skInventoryCoreProjectLatestVersion?.version,
      },
      {
        title: 'Version Code',
        value: this.skInventoryCoreProjectLatestVersion?.versionCode,
      },
      {
        title: 'Last Scanned Date',
        value: dayjs(
          this.skInventoryCoreProjectLatestVersion?.lastScannedDate
        ).format('DD MMM YYYY'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
