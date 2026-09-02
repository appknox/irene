import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { StatusFilter } from 'irene/components/offensive-security/attack-runs';

export interface OffensiveSecurityAttackRunsTableStatusHeaderSignature {
  Args: {
    selectedStatus: StatusFilter;
    onStatusChange: (value: StatusFilter) => void;
  };
}

export default class OffensiveSecurityAttackRunsTableStatusHeaderComponent extends Component<OffensiveSecurityAttackRunsTableStatusHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get statusOptions(): { label: string; value: StatusFilter }[] {
    return [
      { label: this.intl.t('all'), value: 'all' },
      {
        label: this.intl.t('offensiveSecurity.status.running'),
        value: 'running',
      },
      { label: 'Queued', value: 'queued' },
      {
        label: this.intl.t('offensiveSecurity.status.completed'),
        value: 'completed',
      },
      {
        label: this.intl.t('offensiveSecurity.status.failed'),
        value: 'failed',
      },
      { label: 'Not Started', value: 'not_started' },
    ];
  }

  get filterApplied(): boolean {
    return this.args.selectedStatus !== 'all';
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
  selectStatus(value: StatusFilter): void {
    this.anchorRef = null;

    this.args.onStatusChange(value);
  }

  @action
  clearFilter(): void {
    this.selectStatus('all');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::StatusHeader': typeof OffensiveSecurityAttackRunsTableStatusHeaderComponent;
    'offensive-security/attack-runs/table/status-header': typeof OffensiveSecurityAttackRunsTableStatusHeaderComponent;
  }
}
