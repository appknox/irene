import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import UserModel from 'irene/models/user';
import FreshdeskService from 'irene/services/freshdesk';
import IntegrationService from 'irene/services/integration';
import ConfigurationService from 'irene/services/configuration';

export interface HomePageOrganizationDashboardHeaderSignature {
  Args: {
    logoutAction: () => void;
    user: UserModel;
    onToggleOnboardingGuide: () => void;
  };
  Element: HTMLElement;
}

interface ProfileMenuItem {
  label: string;
  iconName: string;
  onClick?: () => void;
  color?: string;
  isLast?: boolean;
}

export default class HomePageOrganizationDashboardHeaderComponent extends Component<HomePageOrganizationDashboardHeaderSignature> {
  @service declare integration: IntegrationService;
  @service declare freshdesk: FreshdeskService;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;

  @tracked profileAnchorRef: HTMLElement | null = null;

  get showKnowledgeBase() {
    return this.freshdesk.supportWidgetIsEnabled;
  }

  get showChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

  get orgIsAnEnterprise() {
    return this.configuration.serverData.enterprise;
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
      this.showChatSupport && {
        label: this.intl.t('support'),
        iconName: 'support',
        onClick: this.openChatBox,
      },
      {
        label: this.intl.t('logout'),
        iconName: 'logout',
        color: 'primary',
        onClick: this.handleLogoutClick,
        isLast: true,
      },
    ].filter(Boolean) as ProfileMenuItem[];
  }

  @action
  handleLogoutClick() {
    this.args.logoutAction();
    this.handleProfileMenuClose();
  }

  @action openChatBox() {
    this.freshdesk.openFreshchatWidget();
    this.handleProfileMenuClose();
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
