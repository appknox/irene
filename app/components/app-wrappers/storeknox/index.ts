import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { MenuItem } from '../side-nav';
import type UserModel from 'irene/models/user';
import type ConfigurationService from 'irene/services/configuration';
import type WhitelabelService from 'irene/services/whitelabel';
import ENV from 'irene/config/environment';

export interface AppWrappersStoreknoxComponentSignature {
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class AppWrappersStoreknoxComponent extends Component<AppWrappersStoreknoxComponentSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare whitelabel: WhitelabelService;

  @tracked isSidebarCollapsed: boolean;
  @tracked showOnboardingGuide = false;
  productVersion = ENV.productVersions['storeknox'];

  constructor(
    owner: unknown,
    args: AppWrappersStoreknoxComponentSignature['Args']
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
          'authenticated.storeknox.inventory.app-list authenticated.storeknox.inventory.pending-reviews authenticated.storeknox.inventory.disabled-apps authenticated.storeknox.inventory-details.index authenticated.storeknox.inventory-details.unscanned-version authenticated.storeknox.inventory-details.unscanned-version.history authenticated.storeknox.inventory-details.unscanned-version.index authenticated.storeknox.inventory-details.brand-abuse authenticated.storeknox.inventory-details.malware-detected',
      },
      {
        label: this.intl.t('discovery'),
        icon: 'search',
        route: 'authenticated.storeknox.discover.result',
        currentWhen:
          'authenticated.storeknox.discover.result authenticated.storeknox.discover.requested',
      },
    ] as MenuItem[];
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get guideCategories() {
    return [
      {
        category: this.intl.t('storeknox.title'),
        guides: [
          {
            id: 'accessing-storeknox',
            title: this.intl.t('storeknox.accessingStoreknox'),
            url: 'https://appknox.portal.trainn.co/share/VHHxO3qE3vgYJDEuusQPRw/embed?mode=interactive',
          },
          {
            id: 'using-inventory',
            title: this.intl.t('storeknox.usingInventory'),
            url: 'https://appknox.portal.trainn.co/share/M2A4zJU5qMWSCLRnuzU4EA/embed?mode=interactive',
          },
          {
            id: 'discovering-apps',
            title: this.intl.t('storeknox.discoveringApps'),
            url: 'https://appknox.portal.trainn.co/share/THztrvyoj3cyvXkXOpa5pg/embed?mode=interactive',
          },
          {
            id: 'reviewing-apps',
            title: this.intl.t('storeknox.reviewingAppRequests'),
            url: 'https://appknox.portal.trainn.co/share/c6V0l6M3YpwRKFymbUHTpg/embed?mode=interactive',
          },
        ],
      },
    ];
  }

  get isWhitelabel() {
    return !this.whitelabel.is_appknox_url;
  }

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;

    this.window.localStorage.setItem(
      'sidebarState',
      this.isSidebarCollapsed ? 'collapsed' : 'expanded'
    );
  }

  @action
  onToggleOnboardingGuide() {
    this.showOnboardingGuide = !this.showOnboardingGuide;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppWrappers::Storeknox': typeof AppWrappersStoreknoxComponent;
  }
}
