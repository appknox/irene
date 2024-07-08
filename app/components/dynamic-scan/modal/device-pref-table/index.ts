import { action } from '@ember/object';
import { faker } from '@faker-js/faker';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

import { type PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import { type DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import styles from './index.scss';
import FileModel from 'irene/models/file';

enum AvailableDeviceFilters {
  'All Available Device' = 'all',
  'Devices with Sim' = 'has_sim',
  'Devices with VPN' = 'has_vpn',
  'Devices with Pin Lock' = 'has_pin_lock',
  'Reserved Devices' = 'is_reserved',
}

export interface DynamicScanModalDevicePrefTableSignature {
  Args: {
    dpContext: DevicePreferenceContext;
    file: FileModel;
  };
}

export default class DynamicScanModalDevicePrefTableComponent extends Component<DynamicScanModalDevicePrefTableSignature> {
  @service declare store: Store;
  @service declare ajax: any;
  @service declare intl: IntlService;

  @tracked limit = 5;
  @tracked offset = 0;

  @tracked devicePrefData: ProjectAvailableDeviceModel[] = [];
  @tracked originalDevicePrefList: ProjectAvailableDeviceModel[] = [];
  @tracked selectedDevicePrefFilter = 'All Available Device';

  constructor(
    owner: unknown,
    args: DynamicScanModalDevicePrefTableComponent['args']
  ) {
    super(owner, args);

    this.fetchAvailableDevices.perform('All Available Device');
  }

  get columns() {
    return [
      {
        name: '',
        component:
          'dynamic-scan/modal/device-pref-table/selected-device' as const,
        width: 40,
      },
      {
        name: 'Type',
        component: 'dynamic-scan/modal/device-pref-table/type' as const,
        textAlign: 'left',
        width: 70,
      },
      {
        name: 'OS Version',
        valuePath: 'platformVersion',
        width: 100,
      },
      {
        name: 'Additional Capabilities',
        component:
          'dynamic-scan/modal/device-pref-table/device-capabilities' as const,
        textAlign: 'left',
        width: 200,
      },
      {
        name: 'Device ID',
        valuePath: 'deviceIdentifier',
      },
    ];
  }

  get currentDevicesInView() {
    let data = [...this.devicePrefData];

    if (data.length >= this.limit) {
      data = data.splice(this.offset, this.limit);
    }

    return data;
  }

  get devicePreferenceTypes() {
    return [
      this.intl.t('modalCard.dynamicScan.allAvailableDevices'),
      this.intl.t('modalCard.dynamicScan.devicesWithSim'),
      this.intl.t('modalCard.dynamicScan.devicesWithVPN'),
      this.intl.t('modalCard.dynamicScan.devicesWithLock'),
    ];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  @action setDevicePrefFilter(opt: keyof typeof AvailableDeviceFilters) {
    this.selectedDevicePrefFilter = opt;

    this.goToPage({ limit: this.limit, offset: 0 });

    this.fetchAvailableDevices.perform(opt);
  }

  @action setSelectedDevice(device: ProjectAvailableDeviceModel) {
    this.args.dpContext.handleSelectDsManualIdentifier(device.deviceIdentifier);
  }

  // Table Actions
  @action goToPage(args: PaginationProviderActionsArgs) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;
  }

  @action onItemPerPageChange(args: PaginationProviderActionsArgs) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;
  }

  // TODO: API unavailable to be implemented. This is a custom implementation
  fetchAvailableDevices = task(
    async (filter: keyof typeof AvailableDeviceFilters) => {
      const filterKey = AvailableDeviceFilters[filter];

      const availableDevices = await this.store.query(
        'project-available-device',
        {
          projectId: this.args.file?.project?.get('id'),
        }
      );

      const originalDeviceList = availableDevices.map((device) => ({
        ...device,
        isTablet: device.isTablet ?? faker.datatype.boolean(),
        hasSim: device.hasSim ?? faker.datatype.boolean(),
        hasVpn: device.hasVpn ?? faker.datatype.boolean(),
        hasPinLock: device.hasPinLock ?? faker.datatype.boolean(),

        deviceIdentifier:
          device.deviceIdentifier ?? faker.string.alphanumeric(7).toUpperCase(),

        platformVersion:
          device.platformVersion ??
          faker.helpers.arrayElement(['13', '12', '14']),
      })) as ProjectAvailableDeviceModel[];

      const filterKeyFormatted = filterKey
        .split('_')
        .reduce(
          (part, str, idx) =>
            idx === 0
              ? part + str
              : part + str[0]?.toUpperCase() + str.slice(1),
          ''
        ) as keyof ProjectAvailableDeviceModel;

      if (filter !== 'All Available Device') {
        // const query = { [filterKey]: true };

        this.devicePrefData = originalDeviceList.filter(
          (dev) => dev[filterKeyFormatted]
        );
      } else {
        this.devicePrefData = originalDeviceList;
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'DynamicScan::Modal::DevicePrefTable': typeof DynamicScanModalDevicePrefTableComponent;
  }
}
