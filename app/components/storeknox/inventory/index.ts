import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import { action } from '@ember/object';

export default class StoreknoxInventoryComponent extends Component {
  @service declare intl: IntlService;

  constructor(owner: unknown, args: object) {
    super(owner, args);
  }

  get breadcrumbItems() {
    return [
      {
        route: 'authenticated.storeknox.discover.result',
        linkTitle: this.intl.t('storeknox.homeTitle'),
      },
      {
        route: 'authenticated.storeknox.inventory.app-list',
        linkTitle: this.intl.t('storeknox.inventory'),
      },
    ];
  }

  get tabItems() {
    return [
      {
        id: 'app-inventory',
        route: 'authenticated.storeknox.inventory.app-list',
        label: this.intl.t('storeknox.appInventory'),
      },
      {
        id: 'disabled-apps',
        route: 'authenticated.storeknox.inventory.disabled-apps',
        label: this.intl.t('storeknox.disabledApps'),
      },
    ];
  }

  @action closeWelcomeModal() {
    this.showWelcomeModal = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory': typeof StoreknoxInventoryComponent;
  }
}
