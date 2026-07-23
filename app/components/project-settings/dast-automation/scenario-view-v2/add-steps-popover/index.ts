import Component from '@glimmer/component';

import {
  STEP_ACTION_CONFIGS,
  type StepActionConfig,
} from '../steps-table/step-actions';

export interface ProjectSettingsDastAutomationScenarioViewV2AddStepsPopoverSignature {
  Element: HTMLElement;
  Args: {
    anchorRef: HTMLElement | null;
    closeHandler: () => void;
    addStep: (config: StepActionConfig) => void;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2AddStepsPopoverComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2AddStepsPopoverSignature> {
  stepActionConfigs = STEP_ACTION_CONFIGS;
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::AddStepsPopover': typeof ProjectSettingsDastAutomationScenarioViewV2AddStepsPopoverComponent;
  }
}
