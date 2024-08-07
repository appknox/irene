import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import UserModel from 'irene/models/user';

export interface HomePageSecurityDashboardNavSignature {
  Args: {
    logoutAction: () => void;
    user: UserModel;
  };
}

export default class HomePageSecurityDashboardNavComponent extends Component<HomePageSecurityDashboardNavSignature> {
  @tracked profileAnchorRef: HTMLElement | null = null;

  get profileMenuItems() {
    return [
      {
        label: this.args.user.username,
        iconName: 'account-circle',
      },
      {
        label: this.args.user.email,
        iconName: 'mail',
      },
      {
        label: 'Logout',
        iconName: 'logout',
        color: 'primary',
        onClick: this.args.logoutAction,
        isLast: true,
      },
    ];
  }

  get menuItems() {
    return [
      {
        id: 'projects',
        route: 'authenticated.security.projects',
        label: 'Projects',
        currentWhen:
          'authenticated.security.projects authenticated.security.files authenticated.security.file',
      },
      {
        id: 'downloadapp',
        route: 'authenticated.security.downloadapp',
        label: 'Download App',
        currentWhen: 'authenticated.security.downloadapp',
      },
      {
        id: 'purgeanalysis',
        route: 'authenticated.security.purgeanalysis',
        label: 'Purge API Analyses',
        currentWhen: 'authenticated.security.purgeanalysis',
      },
    ];
  }

  @action
  toggleProfileMenuView(event: MouseEvent) {
    if (this.profileAnchorRef) {
      this.handleProfileMenuClose();

      return;
    }

    this.profileAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleProfileMenuClose() {
    this.profileAnchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::SecurityDashboardNav': typeof HomePageSecurityDashboardNavComponent;
  }
}
