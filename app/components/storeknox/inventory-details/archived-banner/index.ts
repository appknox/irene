import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsArchivedBannerSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsArchivedBannerComponent extends Component<StoreknoxInventoryDetailsArchivedBannerSignature> {
  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get unarchiveDateString() {
    return this.skInventoryApp.unarchiveDateString;
  }

  get archivedOnString() {
    return dayjs(this.skInventoryApp.archivedOn).format('MMM DD, YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::ArchivedBanner': typeof StoreknoxInventoryDetailsArchivedBannerComponent;
  }
}
