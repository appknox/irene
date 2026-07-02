import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsBannerSignature {
  Args: {
    skInventoryApp: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsBannerComponent extends Component<StoreknoxInventoryDetailsBannerSignature> {
  @service declare intl: IntlService;

  get skInventoryApp() {
    return this.args.skInventoryApp;
  }

  get isArchived() {
    return this.skInventoryApp.isArchived;
  }

  get monitoringEnabled() {
    return this.skInventoryApp.monitoringEnabled;
  }

  get showBanner() {
    return this.isArchived || !this.monitoringEnabled;
  }

  get bannerMessage() {
    if (this.isArchived) {
      return this.intl.t('storeknox.archivedBannerMessage', {
        htmlSafe: true,
        archivedDate: this.archivedOnString,
        unarchiveDate: this.unarchiveDateString,
      });
    }

    return this.intl.t('storeknox.monitoringDisabledBannerMessage', {
      htmlSafe: true,
    });
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
    'Storeknox::InventoryDetails::Banner': typeof StoreknoxInventoryDetailsBannerComponent;
  }
}
