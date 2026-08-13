import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

import type { PlatformFilter } from 'irene/components/offensive-security/attack-runs';

export interface OffensiveSecurityAttackRunsTablePlatformHeaderSignature {
  Args: {
    selectedPlatform: PlatformFilter;
    onPlatformChange: (value: PlatformFilter) => void;
  };
}

export default class OffensiveSecurityAttackRunsTablePlatformHeaderComponent extends Component<OffensiveSecurityAttackRunsTablePlatformHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;

  get platformOptions(): { label: string; value: PlatformFilter }[] {
    return [
      { label: this.intl.t('all'), value: 'all' },
      { label: this.intl.t('android'), value: 'android' },
      { label: this.intl.t('ios'), value: 'ios' },
    ];
  }

  get filterApplied(): boolean {
    return this.args.selectedPlatform !== 'all';
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
  selectPlatform(value: PlatformFilter): void {
    this.anchorRef = null;

    this.args.onPlatformChange(value);
  }

  @action
  clearFilter(): void {
    this.selectPlatform('all');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::AttackRuns::Table::PlatformHeader': typeof OffensiveSecurityAttackRunsTablePlatformHeaderComponent;
    'offensive-security/attack-runs/table/platform-header': typeof OffensiveSecurityAttackRunsTablePlatformHeaderComponent;
  }
}
