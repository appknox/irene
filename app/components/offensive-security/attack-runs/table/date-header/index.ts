import Component from '@glimmer/component';
import { action } from '@ember/object';

import type { SortDirection } from 'irene/components/offensive-security/attack-runs';

export interface OffensiveSecurityAttackRunsTableDateHeaderSignature {
  Args: {
    sortDirection: SortDirection;
    onSortChange: (value: SortDirection) => void;
  };
}

export default class OffensiveSecurityAttackRunsTableDateHeaderComponent extends Component<OffensiveSecurityAttackRunsTableDateHeaderSignature> {
  get isDescending(): boolean {
    return this.args.sortDirection === 'desc';
  }

  @action
  toggleSort(): void {
    this.args.onSortChange(this.isDescending ? 'asc' : 'desc');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::DateHeader': typeof OffensiveSecurityAttackRunsTableDateHeaderComponent;
    'offensive-security/attack-runs/table/date-header': typeof OffensiveSecurityAttackRunsTableDateHeaderComponent;
  }
}
