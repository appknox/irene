import Component from '@glimmer/component';

export interface OrganizationDashboardSideNavSecurityMenuItemSignature {
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

export default class OrganizationDashboardSideNavSecurityMenuItemComponent extends Component<OrganizationDashboardSideNavSecurityMenuItemSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::OrganizationDashboard::SideNav::SecurityMenuItem': typeof OrganizationDashboardSideNavSecurityMenuItemComponent;
    'home-page/organization-dashboard/side-nav/security-menu-item': typeof OrganizationDashboardSideNavSecurityMenuItemComponent;
  }
}
