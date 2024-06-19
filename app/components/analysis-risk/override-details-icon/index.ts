import Component from '@glimmer/component';

export interface AnalysisRiskOverrideDetailsIconSignature {
  Element: SVGElement;
}

export default class AnalysisRiskOverrideDetailsIconComponent extends Component<AnalysisRiskOverrideDetailsIconSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideDetailsIcon': typeof AnalysisRiskOverrideDetailsIconComponent;
  }
}
