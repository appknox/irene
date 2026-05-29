/**
 * Organization Device Registration (agentless CYOD)
 *
 * State-aware popup on the org page:
 *  - On open it loads the org's already-registered devices.
 *  - If devices exist → shows them + the encrypted "run" command (start the
 *    proxy on any machine) + a "Register a new device" button.
 *  - Otherwise (or on "register new") → the generate flow: pick platform → mint a
 *    one-time registration token → show the `mercer --registration-token …` enroll
 *    command → poll until the device registers → show the "run" command.
 *
 * The "run" command carries the org auth token encrypted (--enc-token); the raw
 * token is never shown. mycroft builds both commands.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';

type RegistrationTokenResponse = {
  id: number;
  token: string;
  platform: number;
  expires_at: string;
  connect_command: string;
  run_command: string | null;
};

type RegistrationTokenListResponse = {
  results: { token: string }[];
};

type RegisteredDevice = {
  id: number;
  serial_number: string;
  model: string;
  platform: number;
  is_connected: boolean;
};

type RegisteredDevicesResponse = {
  results: RegisteredDevice[];
  run_command: string | null;
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 150; // ~10 minutes

export interface OrganizationDeviceRegistrationSignature {
  Element: HTMLDivElement;
}

export default class OrganizationDeviceRegistrationComponent extends Component<OrganizationDeviceRegistrationSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showModal = false;
  @tracked showRegisterFlow = false;
  @tracked registeredDevices: RegisteredDevice[] = [];
  @tracked runCommand: string | null = null;

  @tracked selectedPlatform: number = ENUMS.PLATFORM.ANDROID;
  @tracked tokenResult: RegistrationTokenResponse | null = null;
  @tracked registered = false;
  @tracked waitTimedOut = false;

  get isAndroidSelected() {
    return this.selectedPlatform === ENUMS.PLATFORM.ANDROID;
  }

  get isIosSelected() {
    return this.selectedPlatform === ENUMS.PLATFORM.IOS;
  }

  get hasDevices() {
    return this.registeredDevices.length > 0;
  }

  get connectCommand() {
    return this.tokenResult?.connect_command ?? '';
  }

  get tokensUrl() {
    return `/api/organizations/${this.organization.selected?.id}/registration-tokens`;
  }

  get devicesUrl() {
    return `/api/organizations/${this.organization.selected?.id}/registered-devices`;
  }

  @action
  handleOpen() {
    this._reset();
    this.showModal = true;
    this.loadDevices.perform();
  }

  @action
  handleClose() {
    this.watchRegistration.cancelAll();
    this.showModal = false;
  }

  @action
  handleRegisterNew() {
    this.watchRegistration.cancelAll();
    this.tokenResult = null;
    this.registered = false;
    this.waitTimedOut = false;
    this.selectedPlatform = ENUMS.PLATFORM.ANDROID;
    this.showRegisterFlow = true;
  }

  @action
  handleBackToDevices() {
    this.watchRegistration.cancelAll();
    this.tokenResult = null;
    this.registered = false;
    this.waitTimedOut = false;
    this.showRegisterFlow = false;
  }

  @action
  selectAndroid() {
    this.selectedPlatform = ENUMS.PLATFORM.ANDROID;
  }

  @action
  selectIos() {
    this.selectedPlatform = ENUMS.PLATFORM.IOS;
  }

  @action
  handleGenerate() {
    this.generateToken.perform();
  }

  @action
  handleCopySuccess() {
    this.notify.success(this.intl.t('copiedToClipboard'));
  }

  _reset() {
    this.watchRegistration.cancelAll();
    this.tokenResult = null;
    this.registered = false;
    this.waitTimedOut = false;
    this.showRegisterFlow = false;
    this.registeredDevices = [];
    this.runCommand = null;
    this.selectedPlatform = ENUMS.PLATFORM.ANDROID;
  }

  loadDevices = task(async () => {
    const orgId = this.organization.selected?.id;

    if (!orgId) {
      this.showRegisterFlow = true;
      return;
    }

    try {
      const result =
        await this.ajax.request<RegisteredDevicesResponse>(this.devicesUrl);
      this.registeredDevices = result.results ?? [];
      this.runCommand = result.run_command;
    } catch (e) {
      this.registeredDevices = [];
    }

    // No devices yet → go straight to the register flow.
    this.showRegisterFlow = !this.hasDevices;
  });

  generateToken = task(async () => {
    const orgId = this.organization.selected?.id;

    if (!orgId) {
      this.notify.error(this.intl.t('somethingWentWrong'));
      return;
    }

    try {
      const result = await this.ajax.post<RegistrationTokenResponse>(
        this.tokensUrl,
        {
          data: JSON.stringify({ platform: this.selectedPlatform }),
          contentType: 'application/json',
        }
      );

      this.tokenResult = result;
      this.runCommand = result.run_command;
      this.registered = false;
      this.waitTimedOut = false;
      this.watchRegistration.perform(result.token);
    } catch (e) {
      this.notify.error(this.intl.t('orgDeviceRegistrationFailed'));
    }
  });

  // Polls the org's pending tokens; when our token is gone it was consumed
  // (a device registered with it via Mercer), so we flip to the success state.
  watchRegistration = task({ restartable: true }, async (token: string) => {
    for (let i = 0; i < MAX_POLLS; i++) {
      await timeout(POLL_INTERVAL_MS);

      let pending: RegistrationTokenListResponse;
      try {
        pending = await this.ajax.request<RegistrationTokenListResponse>(
          this.tokensUrl
        );
      } catch (e) {
        continue; // transient error — keep polling
      }

      const stillPending = (pending.results ?? []).some(
        (t) => t.token === token
      );

      if (!stillPending) {
        this.registered = true;
        return;
      }
    }

    this.waitTimedOut = true;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::DeviceRegistration': typeof OrganizationDeviceRegistrationComponent;
    'organization/device-registration': typeof OrganizationDeviceRegistrationComponent;
  }
}
