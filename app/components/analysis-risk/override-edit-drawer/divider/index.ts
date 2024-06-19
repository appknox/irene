import Component from '@glimmer/component';

export interface AnalysisRiskOverrideEditDrawerDividerSignature {
  Args: {
    label: string;
  };
}

export default class AnalysisRiskOverrideEditDrawerDividerComponent extends Component<AnalysisRiskOverrideEditDrawerDividerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AnalysisRisk::OverrideEditDrawer::Divider': typeof AnalysisRiskOverrideEditDrawerDividerComponent;
    'analysis-risk/override-edit-drawer/divider': typeof AnalysisRiskOverrideEditDrawerDividerComponent;
  }
}
