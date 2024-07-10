import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

import { type PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';
import { type DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';
import type FileModel from 'irene/models/file';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import styles from './index.scss';

export interface FileDetailsDynamicScanDrawerDevicePrefTableSignature {
  Args: {
    dpContext: DevicePreferenceContext;
    file: FileModel;
    allAvailableManualDevices: ProjectAvailableDeviceModel[];
    isFetchingManualDevices: boolean;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare ajax: any;
  @service declare intl: IntlService;

  @tracked limit = 5;
  @tracked offset = 0;

  @tracked filteredManualDevices: ProjectAvailableDeviceModel[] = [];
  @tracked selectedDevicePrefFilter = 'All Available Device';

  availableManualDeviceModelKeyMap = {
    'All Available Device': 'all',
    'Devices with Sim': 'hasSim',
    'Devices with VPN': 'hasVpn',
    'Devices with Pin Lock': 'hasPinLock',
    'Reserved Devices': 'isReserved',
  };

  get allAvailableManualDevices() {
    return this.args.allAvailableManualDevices;
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
        width: 200,
      },
      {
        name: this.intl.t('deviceId'),
        valuePath: 'deviceIdentifier',
      },
    ];
  }

  get showAllManualDevices() {
    return this.selectedDevicePrefFilter === 'All Available Device';
  }

  get currentDevicesInView() {
    let data = this.showAllManualDevices
      ? [...this.allAvailableManualDevices]
      : [...this.filteredManualDevices];

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

  get showEmptyAvailableDeviceList() {
    return !this.showAllManualDevices && this.filteredManualDevices.length < 1;
  }

  get totalItemsCount() {
    return this.showAllManualDevices
      ? this.allAvailableManualDevices.length
      : this.filteredManualDevices.length;
  }

  @action setDevicePrefFilter(
    opt: keyof typeof this.availableManualDeviceModelKeyMap
  ) {
    this.selectedDevicePrefFilter = opt;

    this.goToPage({ limit: this.limit, offset: 0 });

    this.filterAvailableDevices.perform(opt);
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

  filterAvailableDevices = task(
    async (filter: keyof typeof this.availableManualDeviceModelKeyMap) => {
      const modelFilterKey = this.availableManualDeviceModelKeyMap[
        filter
      ] as keyof ProjectAvailableDeviceModel;

      this.filteredManualDevices = this.allAvailableManualDevices.filter(
        (dev) => filter === 'All Available Device' || dev[modelFilterKey]
      );
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::DevicePrefTable': typeof FileDetailsDynamicScanDrawerDevicePrefTableComponent;
  }
}
