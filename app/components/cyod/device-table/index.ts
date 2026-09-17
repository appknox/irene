/**
 * CYOD registered-device table.
 *
 * Shared by the org-settings CYOD panel (all of the org's devices, owner view)
 * and the account-settings CYOD tab (the member's own connected device). Both
 * read the same mycroft endpoint, which proxies moriarty's device list scoped to
 * the org's external/Mercer-registered devices — so the only difference between
 * the two callers is the surrounding copy, not the data.
 */

import { InvalidError } from '@ember-data/adapter/error';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import type LoggerService from 'irene/services/logger';
import type OrganizationService from 'irene/services/organization';
import type OrganizationCyodRegisteredDeviceModel from 'irene/models/organization-cyod-registered-device';

type OrganizationCyodRegisteredDeviceQueryResponse =
  DS.AdapterPopulatedRecordArray<OrganizationCyodRegisteredDeviceModel> & {
    meta?: { count: number };
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
  @service declare store: Store;
  @service declare organization: OrganizationService;
  @service declare logger: LoggerService;

  @tracked
  devicesResponse: OrganizationCyodRegisteredDeviceQueryResponse | null = null;

  // The org has CYOD enabled but no devicefarm token configured (mycroft returns
  // 400). Distinct from "configured but no devices yet" so the UI can guide the
  // user to their admin instead of showing a dead-end empty state.
  @tracked notConfigured = false;

  constructor(owner: unknown, args: CyodDeviceTableSignature['Args']) {
    super(owner, args);

    this.reloadDevices.perform();
  }

  get devices() {
    return this.devicesResponse?.slice() || [];
  }

  get devicesCount() {
    return this.devicesResponse?.meta?.count ?? 0;
  }

  get visibleDevices() {
    if (this.args.onlyConnected) {
      return this.devices.filter((device) => device.isConnected);
    }

    return this.devices;
  }

  get hasDevices() {
    return this.visibleDevices.length > 0;
  }

  get isLoading() {
    return this.reloadDevices.isRunning;
  }

  get columns() {
    return [
      {
        name: this.intl.t('cyod.deviceTable.name'),
        valuePath: 'deviceName',
        width: 340,
        minWidth: 180,
      },
      {
        name: this.intl.t('cyod.deviceTable.registeredOn'),
        valuePath: 'registeredOn',
        textAlign: 'left',
        width: 130,
      },
      {
        name: this.intl.t('cyod.deviceTable.status'),
        component: 'cyod/device-table/status',
        textAlign: 'center',
        width: 120,
      },
    ];
  }

  @action
  handleRefresh() {
    this.reloadDevices.perform();
  }

  reloadDevices = task({ drop: true }, async () => {
    const orgId = this.organization.selected?.id;
    this.notConfigured = false;

    if (!orgId) {
      this.devicesResponse = null;

      return;
    }

    try {
      this.devicesResponse = (await this.store.query(
        'organization-cyod-registered-device',
        {}
      )) as OrganizationCyodRegisteredDeviceQueryResponse;
    } catch (e) {
      // The DRF adapter maps 400 to an InvalidError. mycroft answers 400 when
      // the org has CYOD but no devicefarm token, so this is "not configured"
      // rather than a failure — surfaced distinctly from the empty state.
      this.notConfigured = e instanceof InvalidError;

      this.devicesResponse = null;

      if (!this.notConfigured) {
        this.logger.error('[CYOD] Could not load registered devices:', e);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Cyod::DeviceTable': typeof CyodDeviceTableComponent;
    'cyod/device-table': typeof CyodDeviceTableComponent;
  }
}
