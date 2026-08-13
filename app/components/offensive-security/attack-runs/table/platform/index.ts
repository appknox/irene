import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTablePlatformSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTablePlatformComponent extends Component<OffensiveSecurityAttackRunsTablePlatformSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Platform': typeof OffensiveSecurityAttackRunsTablePlatformComponent;
    'offensive-security/attack-runs/table/platform': typeof OffensiveSecurityAttackRunsTablePlatformComponent;
  }
}
