/**
 * Account Settings → CYOD Settings (all user roles).
 *
 * Where an individual member enrols their own CYOD device and sees it once it is
 * connected. Registration happens on the member's own machine via the Mercer
 * desktop app (sign in with a Personal Token → register on the Devices tab →
 * start the proxy on the Run tab); the dashboard only explains the steps and
 * shows the resulting device.
 *
 * The org-wide view and the owner's kill-switch live in Organization Settings
 * (`Organization::DeviceRegistration`).
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type OrganizationService from 'irene/services/organization';

export interface AccountSettingsCyodSettingsSignature {
  Element: HTMLDivElement;
}

export default class AccountSettingsCyodSettingsComponent extends Component<AccountSettingsCyodSettingsSignature> {
  @service declare intl: IntlService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showDrawer = false;

  // The tab is hidden without the entitlement, but the route is always
  // registered — guard the panel too so a direct URL doesn't surface CYOD UI to
  // an org that cannot use it.
  get visible() {
    return this.organization.isCyodEnabled;
  }

  get isRegistrationEnabled() {
    return this.organization.isCyodRegistrationEnabled;
  }

  // The mycroft API host to enter on the Mercer app's Login screen — correct for
  // both SaaS and on-prem installs. Falls back to the current origin.
  get serverUrl() {
    return ENV.host || window.location.origin;
  }

  // Where the "Download Mercer" button points. Configured per deployment via
  // IRENE_MERCER_DOWNLOAD_URL; see config/environment.js for the fallback.
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
