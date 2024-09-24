import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import UserModel from 'irene/models/user';
import FreshdeskService from 'irene/services/freshdesk';
import IntegrationService from 'irene/services/integration';
import ConfigurationService from 'irene/services/configuration';

export interface StoreknoxTopNavSignature {
  Args: {
    logoutAction: () => void;
    user: UserModel;
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

export default class StoreknoxTopNavComponent extends Component<StoreknoxTopNavSignature> {
  @service declare integration: IntegrationService;
  @service declare freshdesk: FreshdeskService;
  @service declare intl: IntlService;
  @service declare configuration: ConfigurationService;

  @tracked profileAnchorRef: HTMLElement | null = null;

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
    'Storeknox::TopNav': typeof StoreknoxTopNavComponent;
  }
}
