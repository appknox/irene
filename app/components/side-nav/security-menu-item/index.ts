import Component from '@glimmer/component';

export interface SideNavSecurityMenuItemSignature {
  Args: {
    isCollapsed: boolean;
    classes: {
      menuItemText?: string;
      menuItemLink?: string;
      menuItemLinkActive?: string;
      menuItemTooltip?: string;
    };
  };
  Element: HTMLElement;
}

export default class SideNavSecurityMenuItemComponent extends Component<SideNavSecurityMenuItemSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'SideNav::SecurityMenuItem': typeof SideNavSecurityMenuItemComponent;
    'side-nav/security-menu-item': typeof SideNavSecurityMenuItemComponent;
  }
}
