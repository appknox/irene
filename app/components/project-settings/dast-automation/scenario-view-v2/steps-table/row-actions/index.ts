import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

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
  @service declare intl: IntlService;

  get tooltipMaskText() {
    const step = this.args.step;
    const stepIsNew = step.get('isNew');
    const stepIsEdited = step.get('hasDirtyAttributes');
    const stepIsSecure = step.get('isSecure');
    const isSecureText = this.args.isSecureText;

    if ((stepIsNew || stepIsEdited) && isSecureText) {
      return this.intl.t('dastAutomation.stepUnsavedCannotMask');
    }

    if (isSecureText && stepIsSecure) {
      return this.intl.t('dastAutomation.cannotMaskAlreadyMasked');
    }

    if (!stepIsSecure && isSecureText) {
      return this.intl.t('dastAutomation.clickToMask');
    }

    return this.intl.t('dastAutomation.cannotSecureNonInput');
  }

  get disableDeleteTooltipText() {
    if (this.args.scenarioDetail.isOtherType) {
      return this.intl.t('dastAutomation.atLeastOneStepRequired');
    }

    return this.intl.t('dastAutomation.roleAtLeastOneStepRequired');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::StepsTable::RowActions': typeof ProjectSettingsDastAutomationScenarioViewV2StepsTableRowActionsComponent;
  }
}
