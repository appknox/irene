import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';

import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsAppInfoSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsAppInfoComponent extends Component<StoreknoxInventoryDetailsAppDetailsAppInfoSignature> {
  @service declare intl: IntlService;

  get appDetailsInfo() {
    return [
      {
        id: 'developer',
        title: this.intl.t('storeknox.developer'),
        value: this.args.skInventoryApp?.devName,
      },
      {
        id: 'email-id',
        title: this.intl.t('emailId'),
        value: this.args.skInventoryApp?.devEmail,
      },
      {
        id: 'date-added',
        title: this.intl.t('storeknox.addedToInventoryOn'),
        value: dayjs(this.args.skInventoryApp?.addedOn).format('DD, MMM YYYY'),
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::AppInfo': typeof StoreknoxInventoryDetailsAppDetailsAppInfoComponent;
  }
}
