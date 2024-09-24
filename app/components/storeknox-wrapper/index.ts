import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';
import type { MenuItem } from '../side-nav';
import type ConfigurationService from 'irene/services/configuration';

export interface StoreknoxWrapperComponentSignature {
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class StoreknoxWrapperComponent extends Component<StoreknoxWrapperComponentSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;

  @tracked isSidebarCollapsed: boolean;

  constructor(
    owner: unknown,
    args: StoreknoxWrapperComponentSignature['Args']
  ) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  get storeknoxMenuItems() {
    return [
      {
        label: this.intl.t('inventory'),
        icon: 'inventory-2',
        route: 'authenticated.storeknox.inventory.app-list',
        currentWhen:
          'authenticated.storeknox.inventory authenticated.storeknox.inventory-details',
      },
      {
        label: this.intl.t('discovery'),
        icon: 'search',
        route: 'authenticated.storeknox.discover',
        currentWhen: 'authenticated.storeknox.discover',
      },
    ] as MenuItem[];
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    this.window.localStorage.setItem(
      'sidebarState',
      this.isSidebarCollapsed ? 'collapsed' : 'expanded'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    StoreknoxWrapper: typeof StoreknoxWrapperComponent;
  }
}
