import Component from '@glimmer/component';

export interface StoreReleaseReadinessVerdictNoteSignature {
  Element: HTMLDivElement;
}

// Info icon shown next to a release verdict. Hovering it explains that the
// verdict is a risk indicator, not a prediction of the store review outcome.
export default class StoreReleaseReadinessVerdictNoteComponent extends Component<StoreReleaseReadinessVerdictNoteSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::VerdictNote': typeof StoreReleaseReadinessVerdictNoteComponent;
  }
}
