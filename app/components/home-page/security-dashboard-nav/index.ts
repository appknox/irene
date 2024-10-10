import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import UserModel from 'irene/models/user';
import FreshdeskService from 'irene/services/freshdesk';
import triggerAnalytics from 'irene/utils/trigger-analytics';

export interface HomePageSecurityDashboardNavSignature {
  Args: {
    user: UserModel;
  };
}

export default class HomePageSecurityDashboardNavComponent extends Component<HomePageSecurityDashboardNavSignature> {
  @tracked profileAnchorRef: HTMLElement | null = null;

  @service declare freshdesk: FreshdeskService;
  @service declare session: any;

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
        onClick: this.invalidateSession,
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

  @action invalidateSession() {
    this.freshdesk.logUserOutOfSupportWidget();
    triggerAnalytics('logout', {} as CsbAnalyticsData);
    this.session.invalidate();
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
