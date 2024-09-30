import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import type { DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';
import type FileModel from 'irene/models/file';

export interface FileDetailsDynamicScanDrawerManualDastSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DevicePreferenceContext;
    isApiScanEnabled: boolean;
    enableApiScan(event: MouseEvent, checked?: boolean): void;
    allAvailableManualDevices: ProjectAvailableDeviceModel[];
    isFetchingManualDevices: boolean;
  };
}

export default class FileDetailsDynamicScanDrawerManualDastComponent extends Component<FileDetailsDynamicScanDrawerManualDastSignature> {
  deviceSelectionTypes = ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_CHOICES;

  get file() {
    return this.args.file;
  }

  get manualDeviceSelection() {
    return this.args.dpContext?.dsManualDevicePreference
      ?.ds_manual_device_selection;
  }

  get selectedDeviceSelection() {
    return this.deviceSelectionTypes.find(
      (st) => st.value === this.manualDeviceSelection
    );
  }

  get isSpecificDeviceSelection() {
    return (
      this.manualDeviceSelection ===
      ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE
    );
  }

  get minOsVersion() {
    return this.file.minOsVersion;
  }

  get activeProfileId() {
    return this.file.project.get('activeProfileId');
  }

  get deviceDisplay() {
    return this.file.project.get('platformDisplay');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::ManualDast': typeof FileDetailsDynamicScanDrawerManualDastComponent;
  }
}
