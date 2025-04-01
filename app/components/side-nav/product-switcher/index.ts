import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import styles from './index.scss';
import type ConfigurationService from 'irene/services/configuration';
import type WhitelabelService from 'irene/services/whitelabel';
import type OrganizationService from 'irene/services/organization';

interface SwitcherMenuItem {
  id: string;
  svg:
    | 'ak-svg/sm-indicator'
    | 'ak-svg/vapt-indicator'
    | 'ak-svg/security-indicator';
  label: string;
  route: string;
  key: string;
  openInNewTab?: boolean;
}

export interface SideNavProductSwitcherSignature {
  Args: {
    isCollapsed: boolean;
    productSwitcherFilterKey: string;
    classes: {
      menuItemText?: string;
      menuItemIcon?: string;
    };
  };
  Element: HTMLElement;
}

export default class SideNavProductSwitcherComponent extends Component<SideNavProductSwitcherSignature> {
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;
  @service declare whitelabel: WhitelabelService;
  @service declare organization: OrganizationService;

  @tracked anchorRef: HTMLElement | null = null;

  get classes() {
    return {
      switcherPopoverArrow: styles['switcher-popover-arrow'],
    };
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get isWhitelabel() {
    return !this.whitelabel.is_appknox_url;
  }

  get isSidebarExpanded() {
    return !this.args.isCollapsed;
  }

  get showStoreknox() {
    return this.organization?.selected?.features?.storeknox;
  }

  get isSecurityEnabled() {
    return this.organization.isSecurityEnabled;
  }

  get switcherMenuItems() {
    const allMenuItems = [
      {
        id: 'vapt-svg',
        svg: this.isWhitelabel ? 'ak-svg/vapt-indicator' : 'ak-svg/ak-icon',
        label: this.isWhitelabel ? this.intl.t('vapt') : this.intl.t('appknox'),
        route: 'authenticated.dashboard.projects',
        key: 'appknox',
      },
      this.showStoreknox && {
        id: 'sm-svg',
        svg: this.isWhitelabel ? 'ak-svg/sm-indicator' : 'ak-svg/sk-icon',
        label: this.isWhitelabel
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox.title'),
        route: 'authenticated.storeknox.inventory.app-list',
        key: 'storeknox',
      },
      this.isSecurityEnabled && {
        id: 'security-svg',
        svg: 'ak-svg/security-indicator',
        label: this.intl.t('securityDashboard'),
        route: 'authenticated.security.projects',
        key: 'security',
        openInNewTab: true,
      },
      {
        id: 'report-svg',
        svg: 'ak-svg/report-indicator',
        label: this.intl.t('reportModule.title'),
        route: 'authenticated.reports',
        key: 'report',
      },
    ];

    return allMenuItems.filter(
      (item) => item && item.key !== this.args.productSwitcherFilterKey
    ) as SwitcherMenuItem[];
  }

  @action onClickSwitcher(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action closeSwitcherPopover() {
    this.anchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SideNav::ProductSwitcher': typeof SideNavProductSwitcherComponent;
    'side-nav/product-switcher': typeof SideNavProductSwitcherComponent;
  }
}
