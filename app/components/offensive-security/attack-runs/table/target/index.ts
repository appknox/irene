import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableTargetSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableTargetComponent extends Component<OffensiveSecurityAttackRunsTableTargetSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Target': typeof OffensiveSecurityAttackRunsTableTargetComponent;
    'offensive-security/attack-runs/table/target': typeof OffensiveSecurityAttackRunsTableTargetComponent;
  }
}
