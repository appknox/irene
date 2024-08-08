import Component from '@glimmer/component';
import ProjectAvailableDeviceModel from 'irene/models/project-available-device';

export enum ProjectAvailableDeviceCapabilitiesTranslationsMap {
  hasSim = 'sim',
  hasVpn = 'vpn',
  hasPinLock = 'pinLock',
  hasVnc = 'vnc',
}

export interface FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesSignature {
  Args: {
    deviceProps: ProjectAvailableDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesSignature> {
  get deviceCapabilities() {
    return Object.keys(
      ProjectAvailableDeviceCapabilitiesTranslationsMap
    ).reduce((capabilities, key) => {
      const type =
        key as keyof typeof ProjectAvailableDeviceCapabilitiesTranslationsMap;

      if (this.args.deviceProps[type]) {
        capabilities.push(
          ProjectAvailableDeviceCapabilitiesTranslationsMap[type]
        );
      }

      return capabilities;
    }, [] as string[]);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/device-capabilities': typeof FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesComponent;
  }
}
