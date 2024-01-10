import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import UserModel from 'irene/models/user';

export interface HomePageOrganizationDashboardSignature {
  Args: {
    logoutAction: () => void;
    isSecurityEnabled?: boolean;
    user: UserModel;
  };

  Blocks: {
    default: [];
  };
}

export default class HomePageOrganizationDashboardComponent extends Component<HomePageOrganizationDashboardSignature> {
  @tracked isSidebarCollapsed = true;

  @action
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::OrganizationDashboard': typeof HomePageOrganizationDashboardComponent;
  }
}
