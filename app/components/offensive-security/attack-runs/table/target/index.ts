import Component from '@glimmer/component';

import type OffsecScanModel from 'irene/models/offsec-scan';

export interface OffensiveSecurityAttackRunsTableTargetSignature {
  Args: {
    scan: OffsecScanModel;
  };
}

export default class OffensiveSecurityAttackRunsTableTargetComponent extends Component<OffensiveSecurityAttackRunsTableTargetSignature> {
  /** Package name is shown under the app name unless it is already the displayed name. */
  get showPackageName() {
    const { packageName, displayName } = this.args.scan;

    return Boolean(packageName) && packageName !== displayName;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::Target': typeof OffensiveSecurityAttackRunsTableTargetComponent;
    'offensive-security/attack-runs/table/target': typeof OffensiveSecurityAttackRunsTableTargetComponent;
  }
}
