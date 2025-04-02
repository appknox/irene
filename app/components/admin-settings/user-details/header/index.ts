import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import type IntlService from 'ember-intl/services/intl';
import type OrganizationMemberModel from 'irene/models/organization-member';

interface AdminSettingsUserDetailsHeaderSignature {
  Element: HTMLElement;
  Args: {
    member?: OrganizationMemberModel;
    hideNavTabs?: boolean;
    hideUserDisableMsg?: boolean;
  };
  Blocks: {
    headerCTA: [];
  };
}

export default class AdminSettingsUserDetailsHeaderComponent extends Component<AdminSettingsUserDetailsHeaderSignature> {
  @service declare intl: IntlService;

  @tracked showSettingsDrawer = false;

  constructor(owner: unknown, args: object) {
    super(owner, args);
  }

  get userProductIcon() {
    return [
      'ak-svg/vapt-indicator' as const,
      'ak-svg/vapt-sox-icon' as const,
      'ak-svg/sox-icon' as const,
      'ak-svg/vapt-sox-pending-icon' as const,
      'ak-svg/vapt-sox-disabled-icon' as const,
      'ak-svg/sox-disabled-icon' as const,
    ][Math.floor(Math.random() * 5)];
  }

  get tabItems() {
    return [
      {
        id: 'appknox',
        route: 'authenticated.dashboard.users.index',
        label: this.intl.t('appknox'),
      },
      {
        id: 'storeknox',
        route: 'authenticated.dashboard.users.storeknox',
        label: this.intl.t('storeknox.title'),
      },
    ];
  }

  get userIsDeactivated() {
    return true;
  }

  get showUserDisableNotifBanner() {
    return this.userIsDeactivated && !this.args.hideUserDisableMsg;
  }

  @action openSettingsDrawer() {
    this.showSettingsDrawer = true;
  }

  @action closeSettingsDrawer() {
    this.showSettingsDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::Header': typeof AdminSettingsUserDetailsHeaderComponent;
  }
}
