import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import styles from './index.scss';
import ENUMS from 'irene/enums';
import { type PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';
import type FileModel from 'irene/models/file';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';
import type DsManualDevicePreferenceModel from 'irene/models/ds-manual-device-preference';

enum AvailableManualDeviceFilterKey {
  ALL_AVAILABLE_DEVICES = 'all',
  DEVICES_WITH_SIM = 'has_sim',
  DEVICES_WITH_VPN = 'has_vpn',
  DEVICES_WITH_LOCK = 'has_pin_lock',
  DEVICE_IS_RESERVED = 'is_reserved',
}

export interface AvailableManualDeviceQueryParams {
  limit?: number;
  offset?: number;
  has_sim?: boolean;
  has_vpn?: boolean;
  has_pin_lock?: boolean;
  is_reserved?: boolean;
  platform_version_min?: string;
  platform_version_max?: string;
}

type AvailableManualDeviceFilterOption = {
  label: string;
  value: AvailableManualDeviceFilterKey;
};

type AvailableManualDeviceQueryResponse =
  DS.AdapterPopulatedRecordArray<AvailableManualDeviceModel> & {
    meta: { count: number };
  };

export interface FileDetailsDynamicScanDrawerDevicePrefTableSignature {
  Args: {
    dpContext: DsPreferenceContext;
    file: FileModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  @tracked limit = 5;
  @tracked offset = 0;

  @tracked selectedDeviceFilter = this
    .deviceFilterOptions[0] as AvailableManualDeviceFilterOption;

  @tracked availableDevicesResponse: AvailableManualDeviceQueryResponse | null =
    null;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanDrawerDevicePrefTableSignature['Args']
  ) {
    super(owner, args);

    this.handleFetchAvailableDevices();
  }

  get dpContext() {
    return this.args.dpContext;
  }

  get devicePreference() {
    return this.dpContext.dsManualDevicePreference;
  }

  get loadingMockData() {
    return [1, 2, 3, 4].map((d) => ({ [d]: d }));
  }

  get columns() {
    return [
      {
        name: '',
        component:
          'file-details/dynamic-scan/action/drawer/device-pref-table/selected-device' as const,
        width: 40,
      },
      {
        name: this.intl.t('type'),
        component:
          'file-details/dynamic-scan/action/drawer/device-pref-table/type' as const,
        textAlign: 'left',
        width: 70,
      },
      {
        name: this.intl.t('modalCard.dynamicScan.osVersion'),
        valuePath: 'platformVersion',
        width: 100,
      },
      {
        name: this.intl.t('additionalCapabilities'),
        component:
          'file-details/dynamic-scan/action/drawer/device-pref-table/device-capabilities' as const,
        textAlign: 'left',
        width: 180,
      },
      {
        name: this.intl.t('deviceId'),
        component:
          'file-details/dynamic-scan/action/drawer/device-pref-table/device-id' as const,
      },
    ];
  }

  get deviceFilterOptions() {
    return [
      {
        label: this.intl.t('modalCard.dynamicScan.allAvailableDevices'),
        value: AvailableManualDeviceFilterKey.ALL_AVAILABLE_DEVICES,
      },
      {
        label: this.intl.t('modalCard.dynamicScan.devicesWithSim'),
        value: AvailableManualDeviceFilterKey.DEVICES_WITH_SIM,
      },
      {
        label: this.intl.t('modalCard.dynamicScan.devicesWithVPN'),
        value: AvailableManualDeviceFilterKey.DEVICES_WITH_VPN,
      },
      {
        label: this.intl.t('modalCard.dynamicScan.devicesWithLock'),
        value: AvailableManualDeviceFilterKey.DEVICES_WITH_LOCK,
      },
    ];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get availableManualDevices() {
    return this.availableDevicesResponse?.slice() || [];
  }

  get hasNoAvailableManualDevice() {
    return this.totalAvailableManualDevicesCount === 0;
  }

  get totalAvailableManualDevicesCount() {
    return this.availableDevicesResponse?.meta?.count || 0;
  }

  get showEmptyDeviceListContent() {
    return !this.loadingAvailableDevices && this.hasNoAvailableManualDevice;
  }

  get loadingAvailableDevices() {
    return this.fetchAvailableDevices.isRunning;
  }

  @action
  handleDeviceFilterChange(opt: AvailableManualDeviceFilterOption) {
    this.offset = 0;
    this.selectedDeviceFilter = opt;

    this.handleFetchAvailableDevices();
  }

  @action
  setSelectedDevice(device: AvailableManualDeviceModel) {
    const preference = this.devicePreference as DsManualDevicePreferenceModel;

    preference.dsManualDeviceSelection =
      ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE;

    preference.dsManualDeviceIdentifier = device.deviceIdentifier;

    this.dpContext.updateDsManualDevicePref(preference);
  }

  // Table Actions
  @action
  goToPage({ limit, offset }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = offset;

    this.handleFetchAvailableDevices();
  }

  @action
  onItemPerPageChange({ limit }: PaginationProviderActionsArgs) {
    this.limit = limit;
    this.offset = 0;

    this.handleFetchAvailableDevices();
  }

  @action
  handleFetchAvailableDevices() {
    const filter = this.selectedDeviceFilter.value;

    const isAllDevices =
      filter === AvailableManualDeviceFilterKey.ALL_AVAILABLE_DEVICES;

    this.fetchAvailableDevices.perform({
      limit: this.limit,
      offset: this.offset,
      ...(isAllDevices ? {} : { [filter]: true }),
    });
  }

  fetchAvailableDevices = task(
    async (queryParams: AvailableManualDeviceQueryParams = {}) => {
      try {
        const adapter = this.store.adapterFor('available-manual-device');

        adapter.setNestedUrlNamespace(
          this.args.file.project?.get('id') as string
        );

        this.availableDevicesResponse = (await this.store.query(
          'available-manual-device',
          { ...queryParams, platform_version_min: this.args.file.minOsVersion }
        )) as AvailableManualDeviceQueryResponse;
      } catch (error) {
        this.notify.error(this.intl.t('errorFetchingAvailableDevices'));
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::DevicePrefTable': typeof FileDetailsDynamicScanDrawerDevicePrefTableComponent;
  }
}
