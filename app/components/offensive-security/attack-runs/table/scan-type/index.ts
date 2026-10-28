import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableScanTypeSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableScanTypeComponent extends Component<OffensiveSecurityAttackRunsTableScanTypeSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::ScanType': typeof OffensiveSecurityAttackRunsTableScanTypeComponent;
    'offensive-security/attack-runs/table/scan-type': typeof OffensiveSecurityAttackRunsTableScanTypeComponent;
  }
}
