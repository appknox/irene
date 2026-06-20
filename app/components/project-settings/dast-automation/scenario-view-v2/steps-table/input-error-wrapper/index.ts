import Component from '@glimmer/component';

interface ProjectSettingsDastAutomationScenarioViewV2StepsTableInputErrorWrapperSignature {
  Element: HTMLElement;
  Args: {
    errorMessage?: string | null;
  };
  Blocks: {
    default: [];
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2StepsTableInputErrorWrapperComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2StepsTableInputErrorWrapperSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::InputErrorWrapper': typeof ProjectSettingsDastAutomationScenarioViewV2StepsTableInputErrorWrapperComponent;
  }
}
