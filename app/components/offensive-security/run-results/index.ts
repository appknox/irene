import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

import { scrollDashboardMainContainerTo } from 'irene/utils/scroll-to-top';
import type OffsecScanModel from 'irene/models/offsec-scan';
import type { PentestGoalResult } from 'irene/models/offsec-scan';

export interface OffensiveSecurityRunResultsSignature {
  Args: {
    scan: OffsecScanModel;
    activeGoalParam?: string | null;
    onGoalParamChange: (goalId: string | null) => void;
  };
}

export default class OffensiveSecurityRunResultsComponent extends Component<OffensiveSecurityRunResultsSignature> {
  @service declare router: RouterService;
  @service('browser/window') declare window: Window;

  get pentestGoals(): PentestGoalResult[] {
    return this.args.scan?.pentestGoals ?? [];
  }

  get findings() {
    return this.args.scan?.findingList ?? [];
  }

  get activeGoalIndex(): number | null {
    const param = this.args.activeGoalParam;

    if (!param) {
      return null;
    }

    const index = this.pentestGoals.findIndex(
      (goal, i) => goal.goal_id === param || String(i) === param
    );

    return index === -1 ? null : index;
  }

  get activeGoal(): PentestGoalResult | null {
    return this.activeGoalIndex === null
      ? null
      : (this.pentestGoals[this.activeGoalIndex] ?? null);
  }

  scrollToTop() {
    scrollDashboardMainContainerTo({ top: 0, left: 0 });
    this.window.scrollTo({ top: 0, left: 0 });
  }

  @action
  openGoal(index: number): void {
    const goal = this.pentestGoals[index];

    this.args.onGoalParamChange(goal?.goal_id || String(index));
    this.scrollToTop();
  }

  @action
  closeGoal(): void {
    this.args.onGoalParamChange(null);
    this.scrollToTop();
  }

  @action
  handleFindingClick(findingId: number): void {
    this.router.transitionTo(
      'authenticated.offensive-security.finding',
      this.args.scan.id,
      String(findingId)
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::RunResults': typeof OffensiveSecurityRunResultsComponent;
  }
}
