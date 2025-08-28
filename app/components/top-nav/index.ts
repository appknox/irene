import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type UserModel from 'irene/models/user';
import type FreshdeskService from 'irene/services/freshdesk';
import type UserAuthService from 'irene/services/user-auth';

import styles from './index.scss';

type DefaultBlock = {
  classes: {
    navbarBtn?: string;
  };
};

export interface TopNavSignature {
  Args: {
    product?: IreneProductVariants;
    user: UserModel;
    title?: string;
    showNotifications?: boolean;
  };
  Element: HTMLElement;
  Blocks: {
    default: [DefaultBlock];
  };
}

interface ProfileMenuItem {
  label: string;
  iconName: 'account-circle' | 'mail' | 'logout';
  onClick?: () => void;
  color?: string;
  isLast?: boolean;
}

export default class TopNavComponent extends Component<TopNavSignature> {
  @service declare freshdesk: FreshdeskService;
  @service declare intl: IntlService;
  @service declare userAuth: UserAuthService;

  @tracked profileAnchorRef: HTMLElement | null = null;

  get classes() {
    return {
      navbarBtn: styles['navbar-btn'],
    };
  }

  get showChatSupport() {
    return this.freshdesk.freshchatEnabled;
  }

  get showNotifications() {
    return this.args.showNotifications ?? true;
  }

  get product() {
    return this.args.product ?? 'appknox';
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
    this.userAuth.invalidateSession();
    this.handleProfileMenuClose();
  }

  @action openChatBox() {
    this.freshdesk.openFreshchatWidget();
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
    TopNav: typeof TopNavComponent;
  }
}
