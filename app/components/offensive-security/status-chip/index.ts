import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityStatusChipSignature {
  Args: {
    scan?: OffsecScanModel | null;
  };
}

export default class OffensiveSecurityStatusChipComponent extends Component<OffensiveSecurityStatusChipSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::StatusChip': typeof OffensiveSecurityStatusChipComponent;
    'offensive-security/status-chip': typeof OffensiveSecurityStatusChipComponent;
  }
}
