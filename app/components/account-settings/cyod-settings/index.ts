import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

export interface AccountSettingsCyodSettingsSignature {
  Element: HTMLElement;
}

export default class AccountSettingsCyodSettingsComponent extends Component<AccountSettingsCyodSettingsSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service declare me: MeService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  @tracked showDrawer = false;

  get showCYODSettings() {
    return this.organization.isCyodEnabled;
  }

  get isRegistrationEnabled() {
    return this.organization.isCyodRegistrationEnabled;
  }

  get isOwner() {
    return !!this.me.org?.is_owner;
  }

  get serverUrl() {
    return ENV.host || this.window.location.origin;
  }

  get mercerDownloadUrl() {
    return ENV.mercerDownloadUrl;
  }

  @action
  handleOpen() {
    this.showDrawer = true;
  }

  @action
  handleClose() {
    this.showDrawer = false;
  }

  @action
  handleCopySuccess() {
    this.notify.success(this.intl.t('copiedToClipboard'));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AccountSettings::CyodSettings': typeof AccountSettingsCyodSettingsComponent;
    'account-settings/cyod-settings': typeof AccountSettingsCyodSettingsComponent;
  }
}
