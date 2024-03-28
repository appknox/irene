import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import UserModel from 'irene/models/user';
import FreshdeskService from 'irene/services/freshdesk';
import IntegrationService from 'irene/services/integration';

export interface HomePageOrganizationDashboardHeaderSignature {
  Args: {
    logoutAction: () => void;
    user: UserModel;
  };
  Element: HTMLElement;
}

export default class HomePageOrganizationDashboardHeaderComponent extends Component<HomePageOrganizationDashboardHeaderSignature> {
  @service declare integration: IntegrationService;
  @service declare freshdesk: FreshdeskService;
  @service declare intl: IntlService;

  @tracked profileAnchorRef: HTMLElement | null = null;

  get showKnowledgeBase() {
    return this.freshdesk.supportWidgetIsEnabled;
  }

  get showChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

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
        label: this.intl.t('logout'),
        iconName: 'logout',
        color: 'primary',
        onClick: this.handleLogoutClick,
        isLast: true,
      },
    ];
  }

  @action
  handleLogoutClick() {
    this.args.logoutAction();
    this.handleProfileMenuClose();
  }

  @action openChatBox() {
    this.freshdesk.openFreshchatWidget();
  }

  @action onOpenKnowledgeBase() {
    this.freshdesk.openSupportWidget();
  }

  @action
  handleProfileBtnClick(event: MouseEvent) {
    this.profileAnchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleProfileMenuClose() {
    this.profileAnchorRef = null;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'HomePage::OrganizationDashboard::Header': typeof HomePageOrganizationDashboardHeaderComponent;
  }
}
