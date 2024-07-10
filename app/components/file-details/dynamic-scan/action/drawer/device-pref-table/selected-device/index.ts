import Component from '@glimmer/component';
import { action } from '@ember/object';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';

export interface FileDetailsDynamicScanDrawerDevicePrefTableSelectedDeviceSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
    selectedDeviceId?: string;
    onDeviceClick(device: ProjectAvailableDeviceModel): void;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableSelectedDeviceComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableSelectedDeviceSignature> {
  get devicePrefProps() {
    return this.args.deviceProps;
  }

  get checked() {
    return this.devicePrefProps.deviceIdentifier === this.args.selectedDeviceId;
  }

  @action handleDevicePrefSelect() {
    this.args.onDeviceClick(this.devicePrefProps);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/selected-device': typeof FileDetailsDynamicScanDrawerDevicePrefTableSelectedDeviceComponent;
  }
}
