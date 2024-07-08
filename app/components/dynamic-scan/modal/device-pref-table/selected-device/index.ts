import Component from '@glimmer/component';
import { action } from '@ember/object';
import ProjectAvailableDeviceModel from 'irene/models/project-available-device';

export interface DynamicScanModalDevicePrefTableSelectedDeviceSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
    selectedDeviceId?: string;
    onDeviceClick(device: ProjectAvailableDeviceModel): void;
  };
}

export default class DynamicScanModalDevicePrefTableSelectedDeviceComponent extends Component<DynamicScanModalDevicePrefTableSelectedDeviceSignature> {
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
    'dynamic-scan/modal/device-pref-table/selected-device': typeof DynamicScanModalDevicePrefTableSelectedDeviceComponent;
  }
}
