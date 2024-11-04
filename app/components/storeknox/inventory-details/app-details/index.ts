import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryDetailsAppDetailsSignature {
  Args: {
    skApp: SkAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component<StoreknoxInventoryDetailsAppDetailsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  get skApp() {
    return this.args.skApp;
  }

  get appDetailsInfo() {
    return [
      {
        title: this.intl.t('storeknox.developer'),
        value: this.skApp?.appMetadata.dev_name,
      },
      {
        title: this.intl.t('emailId'),
        value: this.skApp?.appMetadata.dev_email,
      },
      {
        title: this.intl.t('storeknox.addedToInventoryOn'),
        value: dayjs(this.skApp?.addedOn).format('DD, MMM YYYY'),
      },
    ];
  }

  get vaResultsData() {
    return [
      {
        title: 'Version',
        value: '7.1.4',
      },
      {
        title: 'Version Code',
        value: '1605631525',
      },
      {
        title: 'Last Scanned Date',
        value: dayjs().format('DD MMM YYYY'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
