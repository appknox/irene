import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';

enum CapabilitiesTranslationsMap {
  hasSim = 'sim',
  hasVpn = 'vpn',
  hasPinLock = 'pinLock',
  // hasVnc = 'vnc',
}

export interface FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesSignature {
  Args: {
    deviceProps: AvailableManualDeviceModel;
  };
}

export default class FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesComponent extends Component<FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesSignature> {
  @service declare intl: IntlService;

  get deviceCapabilities() {
    return Object.entries(CapabilitiesTranslationsMap)
      .filter(
        ([key]) =>
          this.args.deviceProps[key as keyof typeof CapabilitiesTranslationsMap]
      )
      .map(([, value]) => this.intl.t(value));
  }

  get extraCapabilities() {
    const capabilities = this.args.deviceProps.extraCapabilities;

    return capabilities ? capabilities.split(',').map((c) => c.trim()) : [];
  }

  get allCapabilities() {
    return [...this.deviceCapabilities, ...this.extraCapabilities];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'file-details/dynamic-scan/action/drawer/device-pref-table/device-capabilities': typeof FileDetailsDynamicScanDrawerDevicePrefTableDeviceCapabilitiesComponent;
  }
}
