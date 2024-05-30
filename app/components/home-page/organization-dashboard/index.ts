import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

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
  @service('browser/window') declare window: Window;

  @tracked isSidebarCollapsed: boolean;
  @tracked showOnboardingGuide = false;

  constructor(
    owner: unknown,
    args: HomePageOrganizationDashboardSignature['Args']
  ) {
    super(owner, args);

    const storedState = this.window.localStorage.getItem('sidebarState');

    this.isSidebarCollapsed =
      storedState !== null ? storedState === 'collapsed' : true;
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
    'HomePage::OrganizationDashboard': typeof HomePageOrganizationDashboardComponent;
  }
}
