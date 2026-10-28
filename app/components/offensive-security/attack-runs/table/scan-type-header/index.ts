import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { ScanTypeFilter } from 'irene/components/offensive-security/attack-runs';

export interface OffensiveSecurityAttackRunsTableScanTypeHeaderSignature {
  Args: {
    selectedScanType: ScanTypeFilter;
    onScanTypeChange: (value: ScanTypeFilter) => void;
  };
}

export default class OffensiveSecurityAttackRunsTableScanTypeHeaderComponent extends Component<OffensiveSecurityAttackRunsTableScanTypeHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get scanTypeOptions(): { label: string; value: ScanTypeFilter }[] {
    return [
      { label: this.intl.t('all'), value: 'all' },
      {
        label: this.intl.t('offensiveSecurity.comprehensive'),
        value: 'comprehensive',
      },
      {
        label: this.intl.t('offensiveSecurity.resilienceOnly'),
        value: 'resilience',
      },
    ];
  }

  get filterApplied() {
    return this.args.selectedScanType && this.args.selectedScanType !== 'all';
  }

  @action
  handleClick(event: MouseEvent): void {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action
  handleOptionsClose(): void {
    this.anchorRef = null;
  }

  @action
  selectScanType(value: ScanTypeFilter): void {
    this.anchorRef = null;

    this.args.onScanTypeChange(value);
  }

  @action
  clearFilter(): void {
    this.selectScanType('all');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::ScanTypeHeader': typeof OffensiveSecurityAttackRunsTableScanTypeHeaderComponent;
    'offensive-security/attack-runs/table/scan-type-header': typeof OffensiveSecurityAttackRunsTableScanTypeHeaderComponent;
  }
}
