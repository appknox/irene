import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

export type ResilienceFilter =
  | 'all'
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'weak'
  | 'moderate'
  | 'strong'
  | 'very-strong'
  | 'very_strong';

export interface OffensiveSecurityAttackRunsTableResilienceHeaderSignature {
  Args: {
    selectedResilience: ResilienceFilter;
    onResilienceChange: (value: ResilienceFilter) => void;
  };
}

export default class OffensiveSecurityAttackRunsTableResilienceHeaderComponent extends Component<OffensiveSecurityAttackRunsTableResilienceHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get resilienceOptions(): { label: string; value: ResilienceFilter }[] {
    return [
      { label: this.intl.t('all'), value: 'all' },
      {
        label: this.intl.t('offensiveSecurity.riskLevel.critical'),
        value: 'critical',
      },
      {
        label: this.intl.t('offensiveSecurity.riskLevel.high'),
        value: 'high',
      },
      {
        label: this.intl.t('offensiveSecurity.riskLevel.medium'),
        value: 'medium',
      },
      {
        label: this.intl.t('offensiveSecurity.riskLevel.low'),
        value: 'low',
      },
    ];
  }

  get filterApplied(): boolean {
    return this.args.selectedResilience !== 'all';
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
  selectResilience(value: ResilienceFilter): void {
    this.anchorRef = null;

    this.args.onResilienceChange(value);
  }

  @action
  clearFilter(): void {
    this.selectResilience('all');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::ResilienceHeader': typeof OffensiveSecurityAttackRunsTableResilienceHeaderComponent;
    'offensive-security/attack-runs/table/resilience-header': typeof OffensiveSecurityAttackRunsTableResilienceHeaderComponent;
  }
}
