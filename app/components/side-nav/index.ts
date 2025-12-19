import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';
import type IntegrationService from 'irene/services/integration';
import type WhitelabelService from 'irene/services/whitelabel';
import type FreshdeskService from 'irene/services/freshdesk';

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
    pendoContainerId: string;
    productVersion: string;
    menuItems: MenuItem[];
    lowerMenuItems?: LowerMenuItem[];
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
}

export interface LowerMenuItem {
  title: string;
  icon: 'keyboard-tab' | 'info' | 'chat-bubble';
  divider?: boolean;
  onClick: () => void;
  enablePendo?: boolean;
  iconClass?: string;
  textClass?: string;
  listItemClass?: string;
}

export default class SideNavComponent extends Component<SideNavSignature> {
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service declare integration: IntegrationService;
  @service declare intl: IntlService;
  @service declare whitelabel: WhitelabelService;
  @service declare freshdesk: FreshdeskService;
  @service('browser/window') declare window: Window;

  faviconImage: HTMLImageElement = new Image();
  appLogoImage: HTMLImageElement = new Image();

  constructor(owner: unknown, args: SideNavSignature['Args']) {
    super(owner, args);

    this.faviconImage.src = this.whitelabel.favicon;
    this.appLogoImage.src = this.whitelabel.logo;
  }

  get enablePendo() {
    return this.integration?.isPendoEnabled?.();
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

  get productVersionText() {
    const version = this.args.productVersion;
    const translated = this.intl.t('version');

    return `${translated} - ${version}`;
  }

  get commonLowerMenuItems() {
    return [
      this.enableChatSupport && {
        title: this.intl.t('chatSupport'),
        icon: 'chat-bubble',
        onClick: this.openChatBox,
        iconClass: 'lower-menu-chat',
        textClass: styles['lower-menu-chat'],
      },
      {
        title: this.productVersionText,
        icon: 'info',
        iconClass: 'pendo-ak-icon',
        enablePendo: this.enablePendo,
        onClick: this.showGuide,
        textClass: styles['menu-item-text'],
        listItemClass: this.enablePendo ? '' : 'no-hover',
      },
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
    ].filter(Boolean) as LowerMenuItem[];
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

  get showReport() {
    return this.organization?.selected?.aiFeatures?.reporting;
  }

  get isSecurityEnabled() {
    return this.organization.isSecurityEnabled;
  }

  get enableChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

  get showProductSwitcher() {
    return this.isSecurityEnabled || this.showStoreknox || this.showReport;
  }

  @action openChatBox() {
    this.freshdesk.openFreshchatWidget();
  }

  @action async showGuide() {
    if (this.enablePendo) {
      try {
        const guide = this.window.pendo
          .getActiveGuides()
          .find(function (element) {
            return element.launchMethod === 'auto-badge';
          });

        await guide?.show();
      } catch (e) {
        console.error(e);
      }
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    SideNav: typeof SideNavComponent;
  }
}
