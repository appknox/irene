import { action } from '@ember/object';
import Component from '@glimmer/component';
import ENUMS from 'irene/enums';

import type FileModel from 'irene/models/file';
import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';
import type DsManualDevicePreferenceModel from 'irene/models/ds-manual-device-preference';

export interface FileDetailsDynamicScanDrawerManualDastSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DsPreferenceContext;
    isApiCaptureEnabled: boolean;
    onApiCaptureChange(event: Event, checked?: boolean): void;
  };
}

export default class FileDetailsDynamicScanDrawerManualDastComponent extends Component<FileDetailsDynamicScanDrawerManualDastSignature> {
  deviceSelectionTypes = ENUMS.DS_MANUAL_DEVICE_SELECTION.BASE_CHOICES;

  willDestroy(): void {
    super.willDestroy();

    if (this.dpContext.dsManualDevicePreference?.hasDirtyAttributes) {
      this.dpContext.dsManualDevicePreference.rollbackAttributes();
    }
  }

  get file() {
    return this.args.file;
  }

  get dpContext() {
    return this.args.dpContext;
  }

  get devicePreference() {
    return this.dpContext.dsManualDevicePreference;
  }

  get manualDeviceSelection() {
    return this.devicePreference?.dsManualDeviceSelection;
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

  @action
  handleDsManualDeviceSelectionChange(opt: { value: number }) {
    const preference = this.devicePreference as DsManualDevicePreferenceModel;

    preference.set('dsManualDeviceSelection', opt.value);

    if (opt.value !== ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE) {
      this.dpContext.updateDsManualDevicePref(preference);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::ManualDast': typeof FileDetailsDynamicScanDrawerManualDastComponent;
  }
}
