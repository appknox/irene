import Component from '@glimmer/component';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';

enum CapabilitiesTranslationsMap {
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
    return Object.entries(CapabilitiesTranslationsMap)
      .filter(
        ([key]) =>
          this.args.deviceProps[key as keyof typeof CapabilitiesTranslationsMap]
      )
      .map(([, value]) => value);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/device-capabilities': typeof FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesComponent;
  }
}
