import Component from '@glimmer/component';

import type ProjectModel from 'irene/models/project';
import type ScenarioDetailModel from 'irene/models/scenario-detail';

interface ProjectSettingsDastAutomationScenarioViewV2HeaderSignature {
  Args: {
    project: ProjectModel | null;
    scenarioDetail: ScenarioDetailModel;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2HeaderComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2HeaderSignature> {
  get scenarioDetail() {
    return this.args.scenarioDetail;
  }

  get isNotDefaultScenario() {
    return this.scenarioDetail.isOtherType;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::Header': typeof ProjectSettingsDastAutomationScenarioViewV2HeaderComponent;
  }
}
