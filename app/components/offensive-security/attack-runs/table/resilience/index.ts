import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableResilienceSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableResilienceComponent extends Component<OffensiveSecurityAttackRunsTableResilienceSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Resilience': typeof OffensiveSecurityAttackRunsTableResilienceComponent;
    'offensive-security/attack-runs/table/resilience': typeof OffensiveSecurityAttackRunsTableResilienceComponent;
  }
}
