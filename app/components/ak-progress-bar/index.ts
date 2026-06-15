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
    const input = this.args.segments ?? [];

    let reserved = 0;
    let totalCount = 0;

    for (const s of input) {
      if (s.share != null && s.share > 0) {
        reserved += s.share;
      } else if (s.count != null && s.count > 0) {
        totalCount += s.count;
      }
    }

    reserved = Math.min(100, reserved);
    const remainder = Math.max(0, 100 - reserved);

    const out: AkProgressBarRenderedSegment[] = [];

    for (const s of input) {
      let pct = 0;

      if (s.share != null && s.share > 0) {
        pct = s.share;
      } else if (s.count != null && s.count > 0 && totalCount > 0) {
        pct = (s.count / totalCount) * remainder;
      }

      if (pct > SLIVER_EPSILON) {
        out.push({
          key: s.key,
          pct,
          background: s.background,
          striped: s.striped ?? false,
        });
      }
    }

    return out;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AkProgressBar: typeof AkProgressBarComponent;
    'ak-progress-bar': typeof AkProgressBarComponent;
  }
}
