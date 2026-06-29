import Component from '@glimmer/component';
import type ScenarioDetailModel from 'irene/models/scenario-detail';
import type ScenarioStepModel from 'irene/models/scenario-step';

interface ProjectSettingsDastAutomationScenarioViewV2StepsTableRowActionsSignature {
  Element: HTMLElement;
  Args: {
    step: ScenarioStepModel;
    disabled?: boolean;
    isSecureText: boolean;
    disableDelete: boolean;
    isMasking?: boolean;
    maskingDisabled?: boolean;
    onToggleSecure: (step: ScenarioStepModel) => void;
    onDelete: (step: ScenarioStepModel) => void;
    scenarioDetail: ScenarioDetailModel;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2StepsTableRowActionsComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2StepsTableRowActionsSignature> {
  get tooltipMaskText() {
    const step = this.args.step;
    const stepIsNew = step.get('isNew');
    const stepIsEdited = step.get('hasDirtyAttributes');
    const stepIsSecure = step.get('isSecure');
    const isSecureText = this.args.isSecureText;

    if ((stepIsNew || stepIsEdited) && isSecureText) {
      return 'This step is not saved. You cannot mask it yet.';
    }

    if (isSecureText && stepIsSecure) {
      return 'Cannot mask already masked field';
    }

    if (!stepIsSecure && isSecureText) {
      return 'Click to mask this field';
    }

    return 'Cannot secure non-input field';
  }

  get disableDeleteTooltipText() {
    if (this.args.scenarioDetail.isOtherType) {
      return 'You must have at least one step in a scenario';
    }

    return 'Roles must have at least one step';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::RowActions': typeof ProjectSettingsDastAutomationScenarioViewV2StepsTableRowActionsComponent;
  }
}
