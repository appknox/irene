import Component from '@glimmer/component';

import type { AkProgressBarSegment } from 'irene/components/ak-progress-bar';

type SummarySegmentKey = 'failed' | 'passed' | 'untested' | 'loading';

const CSS_VAR_PREFIX = '--store-release-readiness-summary-progress-bar';

const CSS_VAR_SUFFIX: Record<SummarySegmentKey, string> = {
  failed: 'failed-color',
  passed: 'passed-color',
  untested: 'untested-color',
  loading: 'loading-bg-color',
};

export interface StoreReleaseReadinessSummaryProgressBarSignature {
  Args: {
    failed?: number;
    passed?: number;
    untested?: number;
    isLoading?: boolean;
  };
}

export default class StoreReleaseReadinessSummaryProgressBarComponent extends Component<StoreReleaseReadinessSummaryProgressBarSignature> {
  get akSegments(): AkProgressBarSegment[] {
    const failed = this.args.failed ?? 0;
    const passed = this.args.passed ?? 0;
    const untested = this.args.untested ?? 0;
    const isLoading = this.args.isLoading ?? false;

    const settledTotal = failed + passed;
    const total = settledTotal + untested;

    if (!isLoading) {
      if (total === 0) {
        return [
          {
            key: 'untested',
            share: 100,
            background: this.segmentBackground('untested'),
          },
        ];
      }

      return this.countSegments({ failed, passed, untested });
    }

    if (settledTotal === 0) {
      return [
        {
          key: 'loading',
          share: 100,
          striped: true,
          background: this.segmentBackground('loading'),
        },
      ];
    }

    return [
      ...this.countSegments({ failed, passed }),
      {
        key: 'loading',
        share: 50,
        striped: true,
        background: this.segmentBackground('loading'),
      },
    ];
  }

  private segmentBackground(key: SummarySegmentKey): string {
    return getComputedStyle(document.body).getPropertyValue(
      `${CSS_VAR_PREFIX}-${CSS_VAR_SUFFIX[key]}`
    );
  }

  private countSegments(
    counts: Partial<Record<SummarySegmentKey, number>>
  ): AkProgressBarSegment[] {
    return (Object.entries(counts) as [SummarySegmentKey, number][])
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        key,
        count,
        background: this.segmentBackground(key),
      }));
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ReleaseCard::SummaryProgressBar': typeof StoreReleaseReadinessSummaryProgressBarComponent;
  }
}
