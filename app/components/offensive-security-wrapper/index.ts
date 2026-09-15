import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type UserModel from 'irene/models/user';
import type ConfigurationService from 'irene/services/configuration';
import type { MenuItem } from '../side-nav';

export interface OffensiveSecurityWrapperSignature {
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class OffensiveSecurityWrapperComponent extends Component<OffensiveSecurityWrapperSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;

  @tracked isSidebarCollapsed: boolean;

  productVersion = ENV.productVersions['appknox'];

  constructor(owner: unknown, args: OffensiveSecurityWrapperSignature['Args']) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  get menuItems(): MenuItem[] {
    return [
      {
        label: this.intl.t('offensiveSecurity.attackRuns'),
        icon: 'terminal-2',
        route: 'authenticated.offensive-security',
        currentWhen: 'authenticated.offensive-security',
      },
    ];
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
    OffensiveSecurityWrapper: typeof OffensiveSecurityWrapperComponent;
  }
}
