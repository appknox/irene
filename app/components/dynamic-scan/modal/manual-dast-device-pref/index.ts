import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import type { DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type FileModel from 'irene/models/file';

export interface DynamicScanModalManualDastDevicePrefSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DevicePreferenceContext;
    isApiScanEnabled: boolean;
    enableApiScan(event: MouseEvent, checked?: boolean): void;
  };
}

export default class DynamicScanModalManualDastDevicePrefComponent extends Component<DynamicScanModalManualDastDevicePrefSignature> {
  deviceSelectionTypes = ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_CHOICES;

  get selectedDeviceSelection() {
    return this.deviceSelectionTypes.find(
      (st) =>
        st.value === this.args.dpContext.projectProfile?.dsManualDeviceSelection
    );
  }

  get isSpecificDeviceSelection() {
    return (
      this.selectedDeviceSelection?.value ===
      ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE
    );
  }

  get minOsVersion() {
    return (
      this.args.dpContext.projectProfile?.dsAutomatedPlatformVersionMin || '6.0'
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'DynamicScan::Modal::ManualDastDevicePref': typeof DynamicScanModalManualDastDevicePrefComponent;
  }
}
