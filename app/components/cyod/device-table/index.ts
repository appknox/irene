/**
 * CYOD registered-device table.
 *
 * Shared by the org-settings CYOD panel (all of the org's devices, owner view)
 * and the account-settings CYOD tab (the member's own connected device). Both
 * read the same mycroft endpoint, which proxies moriarty's device list scoped to
 * the org's external/Mercer-registered devices — so the only difference between
 * the two callers is the surrounding copy, not the data.
 */
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';
import type OrganizationService from 'irene/services/organization';

export type RegisteredDevice = {
  id: number;
  name?: string;
  serial_number: string;
  model: string;
  platform: number;
  is_connected: boolean;
  created_on?: string;
};

type RegisteredDevicesResponse = {
  results: RegisteredDevice[];
};

export type DeviceRow = {
  id: number;
  deviceName: string;
  registeredOn: string;
  isConnected: boolean;
};

export interface CyodDeviceTableSignature {
  Element: HTMLDivElement;
  Args: {
    // Rendered instead of the table when the org has no registered devices.
    // Callers differ here: the org panel points at the account-settings tab,
    // the account tab points at its own "Register a device" button.
    emptyHint?: string;
    // When set, the table renders its own header row (title, optional
    // description, refresh button). Omit it to render the bare table.
    heading?: string;
    subheading?: string;
    // Show only devices currently online. Used by the account-settings view
    // ("Your connected device"), where an offline device is not actionable.
    // The org view leaves this off so owners see the full inventory.
    onlyConnected?: boolean;
  };
  Blocks: {
    emptyAction?: [];
  };
}

export default class CyodDeviceTableComponent extends Component<CyodDeviceTableSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare organization: OrganizationService;

  @tracked devices: RegisteredDevice[] = [];

  // The org has CYOD enabled but no devicefarm token configured (mycroft returns
  // 400). Distinct from "configured but no devices yet" so the UI can guide the
  // user to their admin instead of showing a dead-end empty state.
  @tracked notConfigured = false;

  constructor(owner: unknown, args: CyodDeviceTableSignature['Args']) {
    super(owner, args);

    this.reload.perform();
  }

  get devicesUrl() {
    return `/api/organizations/${this.organization.selected?.id}/registered-devices`;
  }

  get visibleDevices() {
    if (this.args.onlyConnected) {
      return this.devices.filter((device) => device.is_connected);
    }

    return this.devices;
  }

  get hasDevices() {
    return this.visibleDevices.length > 0;
  }

  get isLoading() {
    return this.reload.isRunning;
  }

  // ember-table spreads leftover width across every column, so the name column
  // only gets a fair share of it unless it is given a much larger base width.
  // Weighting it this way pulls the two trailing columns left and leaves room
  // for long device names before they truncate.
  get columns() {
    return [
      {
        name: this.intl.t('cyodDeviceTable.name'),
        valuePath: 'deviceName',
        width: 340,
        minWidth: 180,
      },
      {
        name: this.intl.t('cyodDeviceTable.registeredOn'),
        valuePath: 'registeredOn',
        textAlign: 'left',
        width: 130,
      },
      {
        name: this.intl.t('cyodDeviceTable.status'),
        component: 'cyod/device-table/status',
        textAlign: 'left',
        width: 120,
      },
    ];
  }

  get rows(): DeviceRow[] {
    return this.visibleDevices.map((device) => ({
      id: device.id,
      deviceName: device.name || device.model || device.serial_number,
      registeredOn: device.created_on
        ? dayjs(device.created_on).format('D MMMM YYYY')
        : '-',
      isConnected: device.is_connected,
    }));
  }

  @action
  handleRefresh() {
    this.reload.perform();
  }

  reload = task({ drop: true }, async () => {
    const orgId = this.organization.selected?.id;

    this.notConfigured = false;

    if (!orgId) {
      this.devices = [];

      return;
    }

    try {
      const result = await this.ajax.request<RegisteredDevicesResponse>(
        this.devicesUrl
      );

      this.devices = result.results ?? [];
    } catch (e) {
      // 400 = CYOD device farm not configured for this org (no devicefarm
      // token). Surfaced distinctly instead of the generic empty state.
      this.notConfigured = (e as AjaxError)?.status === 400;
      this.devices = [];
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Cyod::DeviceTable': typeof CyodDeviceTableComponent;
    'cyod/device-table': typeof CyodDeviceTableComponent;
  }
}
