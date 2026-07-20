import Component from '@glimmer/component';

const SLIVER_EPSILON = 0.05;

export type AkProgressBarSegment = {
  key: string;
  count?: number;
  share?: number;
  background?: string;
  striped?: boolean;
};

export type AkProgressBarRenderedSegment = {
  key: string;
  pct: number;
  background?: string;
  striped: boolean;
};

export interface AkProgressBarSignature {
  Element: HTMLDivElement;
  Args: {
    segments: AkProgressBarSegment[];
    height?: string;
  };
}

export default class AkProgressBarComponent extends Component<AkProgressBarSignature> {
  get renderedSegments(): AkProgressBarRenderedSegment[] {
    const segments = this.args.segments ?? [];

    let reserved = 0;
    let totalCount = 0;

    for (const segment of segments) {
      if (segment.share != null && segment.share > 0) {
        reserved += segment.share;
      } else if (segment.count != null && segment.count > 0) {
        totalCount += segment.count;
      }
    }

    reserved = Math.min(100, reserved);
    const remainder = Math.max(0, 100 - reserved);

    const renderedSegments: AkProgressBarRenderedSegment[] = [];

    for (const segment of segments) {
      let pct = 0;

      if (segment.share != null && segment.share > 0) {
        pct = segment.share;
      } else if (segment.count != null && segment.count > 0 && totalCount > 0) {
        pct = (segment.count / totalCount) * remainder;
      }

      if (pct > SLIVER_EPSILON) {
        renderedSegments.push({
          key: segment.key,
          pct,
          background: segment.background,
          striped: segment.striped ?? false,
        });
      }
    }

    return renderedSegments;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkProgressBar: typeof AkProgressBarComponent;
    'ak-progress-bar': typeof AkProgressBarComponent;
  }
}
