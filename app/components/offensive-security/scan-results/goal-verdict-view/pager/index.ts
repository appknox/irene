import Component from '@glimmer/component';

export interface GoalVerdictViewPagerSignature {
  Args: {
    current: number;
    total: number;
    previousLabel: string;
    nextLabel: string;
    singleLabel: string;
    /** Show `1 of 1` with both buttons off, instead of the single label, when there is one page. */
    alwaysShow?: boolean;
    onPrevious: () => void;
    onNext: () => void;
  };
}

export default class GoalVerdictViewPagerComponent extends Component<GoalVerdictViewPagerSignature> {
  get showNav(): boolean {
    return (
      this.args.total > 1 || Boolean(this.args.alwaysShow && this.args.total)
    );
  }

  get isFirst(): boolean {
    return this.args.current <= 1;
  }

  get isLast(): boolean {
    return this.args.current >= this.args.total;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OffensiveSecurity::ScanResults::GoalVerdictView::Pager': typeof GoalVerdictViewPagerComponent;
  }
}
