import Component from '@glimmer/component';

export type SummaryProgressSegmentKind =
  | 'failed'
  | 'passed'
  | 'untested'
  | 'loading';

export interface SummaryProgressSegment {
  kind: SummaryProgressSegmentKind;
  pct: number;
}

export interface StoreReleaseReadinessSummaryProgressBarSignature {
  Args: {
    failed?: number;
    passed?: number;
    untested?: number;
    isLoading?: boolean;
  };
}

export default class StoreReleaseReadinessSummaryProgressBarComponent extends Component<StoreReleaseReadinessSummaryProgressBarSignature> {
  get segments(): SummaryProgressSegment[] {
    const f = this.args.failed ?? 0;
    const p = this.args.passed ?? 0;
    const u = this.args.untested ?? 0;
    const isLoading = this.args.isLoading ?? false;
    const total = f + p + u;

    if (total === 0) {
      return isLoading
        ? [{ kind: 'loading', pct: 100 }]
        : [{ kind: 'untested', pct: 100 }];
    }

    const failedPct = (f / total) * 100;
    const passedPct = (p / total) * 100;
    const untestedPct = (u / total) * 100;

    const segs: SummaryProgressSegment[] = [];

    if (f > 0) {
      segs.push({ kind: 'failed', pct: failedPct });
    }
    if (p > 0) {
      segs.push({ kind: 'passed', pct: passedPct });
    }

    if (isLoading) {
      const loadingPct =
        u > 0 ? untestedPct : Math.max(0, 100 - failedPct - passedPct);
      if (loadingPct > 0.05) {
        segs.push({ kind: 'loading', pct: loadingPct });
      }
    } else if (u > 0) {
      segs.push({ kind: 'untested', pct: untestedPct });
    }

    return segs.filter((s) => s.pct > 0.05);
  }

  get ariaLabel() {
    const f = this.args.failed ?? 0;
    const p = this.args.passed ?? 0;
    const u = this.args.untested ?? 0;
    const loading = this.args.isLoading ? ' in progress' : '';
    return `Summary: ${f} failed, ${p} passed, ${u} untested${loading}`;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ReleaseCard::SummaryProgressBar': typeof StoreReleaseReadinessSummaryProgressBarComponent;
  }
}
