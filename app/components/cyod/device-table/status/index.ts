import Component from '@glimmer/component';
import type OrganizationCyodRegisteredDeviceModel from 'irene/models/organization-cyod-registered-device';

export interface CyodDeviceTableStatusSignature {
  Element: HTMLDivElement;
  Args: { device: OrganizationCyodRegisteredDeviceModel };
}

export default class CyodDeviceTableStatusComponent extends Component<CyodDeviceTableStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Cyod::DeviceTable::Status': typeof CyodDeviceTableStatusComponent;
    'cyod/device-table/status': typeof CyodDeviceTableStatusComponent;
  }
}
