import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';
import type FreshdeskService from 'irene/services/freshdesk';
import type IntegrationService from 'irene/services/integration';
import type ConfigurationService from 'irene/services/configuration';

export interface StoreknoxWrapperTopNavSignature {
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

export default class StoreknoxWrapperTopNavComponent extends Component<StoreknoxWrapperTopNavSignature> {
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
    ] as ProfileMenuItem[];
  }

  @action
  handleLogoutClick() {
    this.args.logoutAction();
    this.handleProfileMenuClose();
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
    'StoreknoxWrapper::TopNav': typeof StoreknoxWrapperTopNavComponent;
  }
}
