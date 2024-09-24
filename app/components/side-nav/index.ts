import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type IntegrationService from 'irene/services/integration';
import type WhitelabelService from 'irene/services/whitelabel';
import styles from './index.scss';

type DefaultBlock = {
  classes: {
    menuItemLink?: string;
    menuItemLinkActive?: string;
    menuItemTooltip?: string;
    menuItemIcon?: string;
    menuItemText?: string;
  };
};

export interface SideNavSignature {
  Args: {
    menuItems: MenuItem[];
    lowerMenuItems?: LowerMenuItem[];
    isSecurityEnabled?: boolean;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    productSwitcherFilterKey: string;
  };
  Element: HTMLElement;
  Blocks: {
    default: [DefaultBlock];
  };
}

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  query?: Record<string, string | number>;
  currentWhen?: string;
  hasBadge?: boolean;
  badgeLabel?: string;
  component?: 'side-nav/security-menu-item';
  customIconComponent?: 'ak-svg/public-api-icon';
}

export interface LowerMenuItem {
  title: string;
  icon: string;
  divider?: boolean;
  onClick: () => void;
  enablePendo?: boolean;
  iconClass?: string;
  textClass?: string;
  listItemClass?: string;
}

export interface SwitcherMenuItem {
  id: string;
  svg: 'ak-svg/sm-indicator' | 'ak-svg/vp-indicator';
  label: string;
  route: string;
  key: string;
}

export default class SideNavComponent extends Component<SideNavSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare integration: IntegrationService;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;
  @service('browser/window') declare window: Window;

  faviconImage: HTMLImageElement = new Image();
  appLogoImage: HTMLImageElement = new Image();

  constructor(owner: unknown, args: SideNavSignature['Args']) {
    super(owner, args);

    this.faviconImage.src = this.whitelabel.favicon;
    this.appLogoImage.src = this.whitelabel.logo;
  }

  get classes() {
    return {
      menuItemText: styles['menu-item-text'],
      menuItemLink: styles['menu-item-link'],
      menuItemLinkActive: styles['active'],
      menuItemTooltip: styles['menu-item-tooltip'],
      menuItemIcon: styles['menu-item-icon'],
    };
  }

  get commonLowerMenuItems() {
    return [
      {
        title: this.args.isCollapsed
          ? this.intl.t('expand')
          : this.intl.t('collapse'),
        icon: 'keyboard-tab',
        onClick: this.args.toggleSidebar,
        textClass: styles['menu-item-text'],
        iconClass: this.isSidebarExpanded ? 'rotated-icon' : '',
        divider: true,
      },
    ] as LowerMenuItem[];
  }

  get lowerMenuItems() {
    return [
      ...(this.args.lowerMenuItems ?? []),
      ...this.commonLowerMenuItems,
    ] as LowerMenuItem[];
  }

  get isSidebarExpanded() {
    return !this.args.isCollapsed;
  }

  get showStoreknox() {
    return this.organization?.selected?.features?.storeknox;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SideNav: typeof SideNavComponent;
  }
}
