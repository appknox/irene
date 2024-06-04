import Component from '@glimmer/component';

export interface AnalysisRiskOverriddenIconSignature {
  Element: SVGElement;
}

export default class AnalysisRiskOverriddenIconComponent extends Component<AnalysisRiskOverriddenIconSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverriddenIcon': typeof AnalysisRiskOverriddenIconComponent;
  }
}
