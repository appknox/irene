import Component from '@glimmer/component';

import type { DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type FileModel from 'irene/models/file';

export interface DynamicScanModalManualDastDevicePrefSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DevicePreferenceContext;
    enableApiScan(event: Event, checked: boolean): void;
  };
}

export default class DynamicScanModalManualDastDevicePrefComponent extends Component<DynamicScanModalManualDastDevicePrefSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'DynamicScan::Modal::AutomatedDastDevicePref': typeof DynamicScanModalManualDastDevicePrefComponent;
  }
}
