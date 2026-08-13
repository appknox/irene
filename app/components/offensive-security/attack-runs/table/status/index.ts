import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableStatusSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableStatusComponent extends Component<OffensiveSecurityAttackRunsTableStatusSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Status': typeof OffensiveSecurityAttackRunsTableStatusComponent;
    'offensive-security/attack-runs/table/status': typeof OffensiveSecurityAttackRunsTableStatusComponent;
  }
}
