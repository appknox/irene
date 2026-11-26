import Component from '@glimmer/component';
import type { ReachabilityTone } from 'irene/utils/sbom-reachability';

export interface SbomReachabilityPillSignature {
  Element: HTMLSpanElement;
  Args: {
    label: string;
    tone: ReachabilityTone;
  };
}

/**
 * Neutral, labelled pill: the dot carries the hue and the text stays dark,
 * so no verdict is colour-only.
 */
export default class SbomReachabilityPillComponent extends Component<SbomReachabilityPillSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Sbom::ReachabilityPill': typeof SbomReachabilityPillComponent;
    'sbom/reachability-pill': typeof SbomReachabilityPillComponent;
  }
}
