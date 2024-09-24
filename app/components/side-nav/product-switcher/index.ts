import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import styles from './index.scss';
import type { SwitcherMenuItem } from '..';
import type ConfigurationService from 'irene/services/configuration';

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

  @tracked anchorRef: HTMLElement | null = null;

  get classes() {
    return {
      switcherPopoverArrow: styles['switcher-popover-arrow'],
    };
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
  }

  get isSidebarExpanded() {
    return !this.args.isCollapsed;
  }

  get switcherMenuItems() {
    const allMenuItems: SwitcherMenuItem[] = [
      {
        id: 'vp-svg',
        svg: 'ak-svg/vp-indicator',
        label: this.orgIsAnEnterprise
          ? this.intl.t('vapt')
          : this.intl.t('appknox'),
        route: 'authenticated.dashboard.projects',
        key: 'appknox',
      },
      {
        id: 'sm-svg',
        svg: 'ak-svg/sm-indicator',
        label: this.orgIsAnEnterprise
          ? this.intl.t('appMonitoring')
          : this.intl.t('storeknox'),
        route: 'authenticated.storeknox.discover',
        key: 'storeknox',
      },
    ];

    return allMenuItems.filter(
      (item) => item.key !== this.args.productSwitcherFilterKey
    );
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
