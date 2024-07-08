import Component from '@glimmer/component';
import ProjectAvailableDeviceModel from 'irene/models/project-available-device';

enum ProjectAvailableDeviceCapabilitiesMap {
  hasSim = 'sim',
  hasVpn = 'vpn',
  hasPinLock = 'pinLock',
  hasVnc = 'vnc',
}

export interface DynamicScanModalDevicePrefTableDeviceCapabilitiesSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
    selectedDevice: ProjectAvailableDeviceModel;
  };
}

export default class DynamicScanModalDevicePrefTableDeviceCapabilitiesComponent extends Component<DynamicScanModalDevicePrefTableDeviceCapabilitiesSignature> {
  get deviceCapabilities() {
    return Object.keys(ProjectAvailableDeviceCapabilitiesMap).reduce(
      (capabilities, key) => {
        const type = key as keyof typeof ProjectAvailableDeviceCapabilitiesMap;

        if (this.args.deviceProps[type]) {
          capabilities.push(ProjectAvailableDeviceCapabilitiesMap[type]);
        }

        return capabilities;
      },
      [] as string[]
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'dynamic-scan/modal/device-pref-table/device-capabilities': typeof DynamicScanModalDevicePrefTableDeviceCapabilitiesComponent;
  }
}
