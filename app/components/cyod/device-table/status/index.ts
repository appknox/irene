/**
 * Device Status cell for the CYOD device table — Online / Offline chip.
 *
 * Rendered through AkTable's `component` column hook, which passes the row value
 * as `@device`.
 */
import Component from '@glimmer/component';

import type { DeviceRow } from 'irene/components/cyod/device-table';

export interface CyodDeviceTableStatusSignature {
  Element: HTMLDivElement;
  Args: {
    device: DeviceRow;
  };
}

export default class CyodDeviceTableStatusComponent extends Component<CyodDeviceTableStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Cyod::DeviceTable::Status': typeof CyodDeviceTableStatusComponent;
    'cyod/device-table/status': typeof CyodDeviceTableStatusComponent;
  }
}
