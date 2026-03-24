import Component from '@glimmer/component';
import { action } from '@ember/object';

import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';

export interface ProjectSettingsDastAutomationAutomationScenarioTableEditSignature {
  Args: {
    scenario: ScanParameterGroupModel;
    onEditScenario(scenario: ScanParameterGroupModel): void;
  };
}

export default class ProjectSettingsDastAutomationAutomationScenarioTableEditComponent extends Component<ProjectSettingsDastAutomationAutomationScenarioTableEditSignature> {
  @action handleEditClick(event: Event) {
    event.stopPropagation();
    this.args.onEditScenario(this.args.scenario);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScenarioTable::Edit': typeof ProjectSettingsDastAutomationAutomationScenarioTableEditComponent;
  }
}
