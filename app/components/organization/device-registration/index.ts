/**
 * Organization Device Registration (agentless CYOD / Mercer)
 *
 * Lists the org's registered CYOD devices and shows the Mercer setup commands.
 *
 * Registration now happens on the operator's machine via the Mercer CLI
 * (`mercer login` → `mercer register` → `mercer run`), authenticated with a
 * developer PersonalToken. The dashboard no longer mints one-time registration
 * tokens or builds encrypted run commands — it only surfaces the device list and
 * copy-paste setup. The `--dev-token`/`--url` flag form is documented in
 * `mercer help`; both the exported-env and flag forms work (flags override env).
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';
import type IreneAjaxService from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';

type RegisteredDevice = {
  id: number;
  serial_number: string;
  model: string;
  platform: number;
  is_connected: boolean;
};

type RegisteredDevicesResponse = {
  results: RegisteredDevice[];
};

export interface OrganizationDeviceRegistrationSignature {
  Element: HTMLDivElement;
}

export default class OrganizationDeviceRegistrationComponent extends Component<OrganizationDeviceRegistrationSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked showModal = false;
  @tracked registeredDevices: RegisteredDevice[] = [];

  get hasDevices() {
    return this.registeredDevices.length > 0;
  }

  get devicesUrl() {
    return `/api/organizations/${this.organization.selected?.id}/registered-devices`;
  }

  // The mycroft API host the Mercer CLI logs in against — correct for both SaaS
  // and on-prem installs. Falls back to the current origin.
  get serverUrl() {
    return ENV.host || window.location.origin;
  }

  // Export-style setup block. The equivalent flag form
  // (`mercer login --dev-token <token> --url <host>`) is shown by `mercer help`.
  get setupCommands() {
    return [
      'export MERCER_DEV_TOKEN=<your-developer-token>',
      `export MERCER_APPKNOX_URL=${this.serverUrl}`,
      'mercer login',
      'mercer register',
      'mercer run',
    ].join('\n');
  }

  @action
  handleOpen() {
    this.showModal = true;
    this.loadDevices.perform();
  }

  @action
  handleClose() {
    this.showModal = false;
  }

  @action
  handleRefresh() {
    this.loadDevices.perform();
  }

  @action
  handleCopySuccess() {
    this.notify.success(this.intl.t('copiedToClipboard'));
  }

  loadDevices = task(async () => {
    const orgId = this.organization.selected?.id;

    if (!orgId) {
      this.registeredDevices = [];
      return;
    }

    try {
      const result = await this.ajax.request<RegisteredDevicesResponse>(
        this.devicesUrl
      );

      this.registeredDevices = result.results ?? [];
    } catch (e) {
      this.registeredDevices = [];
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::DeviceRegistration': typeof OrganizationDeviceRegistrationComponent;
    'organization/device-registration': typeof OrganizationDeviceRegistrationComponent;
  }
}
