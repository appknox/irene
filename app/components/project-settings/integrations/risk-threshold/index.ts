import Component from '@glimmer/component';

interface ProjectSettingsIntegrationsRiskThresholdSignature {
  Element: HTMLElement;
  Args: { computedRisk: number };
}

export default class ProjectSettingsIntegrationsRiskThresholdComponent extends Component<ProjectSettingsIntegrationsRiskThresholdSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Integrations::RiskThreshold': typeof ProjectSettingsIntegrationsRiskThresholdComponent;
  }
}
