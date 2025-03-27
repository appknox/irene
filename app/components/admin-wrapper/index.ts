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

export interface AdminWrapperComponentSignature {
  Args: {
    user: UserModel;
  };
  Blocks: {
    default: [];
  };
}

export default class AdminWrapperComponent extends Component<AdminWrapperComponentSignature> {
  @service('browser/window') declare window: Window;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare whitelabel: WhitelabelService;

  @tracked isSidebarCollapsed: boolean;
  productVersion = ENV.productVersions['storeknox'];

  constructor(owner: unknown, args: AdminWrapperComponentSignature['Args']) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
  }

  get adminMenuItems() {
    return [
      {
        label: this.intl.t('sso'),
        icon: 'key',
        route: 'authenticated.admin.sso',
        currentWhen: 'authenticated.admin.sso',
      },
      {
        label: this.intl.t('userManagement'),
        icon: 'groups',
        route: 'authenticated.admin.user-management.users',
        currentWhen:
          'authenticated.admin.user-management authenticated.admin.user-management.users authenticated.admin.user-management.email-domain-restrictions',
      },
      {
        label: this.intl.t('mfa'),
        icon: 'lock',
        route: 'authenticated.admin.mfa',
        currentWhen: 'authenticated.admin.mfa',
      },
      {
        label: this.intl.t('serviceAccount'),
        icon: 'manage-accounts',
        route: 'authenticated.admin.service-account',
        currentWhen: 'authenticated.admin.service-account',
      },
      // {
      //   label: this.intl.t('billing'),
      //   icon: 'request-quote',
      //   route: 'authenticated.admin.billing',
      //   currentWhen: 'authenticated.admin.billing',
      // },
    ] as MenuItem[];
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AdminWrapper: typeof AdminWrapperComponent;
  }
}
