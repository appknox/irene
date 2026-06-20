import Component from '@glimmer/component';

export interface ProjectSettingsDastAutomationScenarioViewV2SkeletonLoaderSignature {
  Element: HTMLElement;
  Args: {
    stepRowCount?: number;
  };
}

export default class ProjectSettingsDastAutomationScenarioViewV2SkeletonLoaderComponent extends Component<ProjectSettingsDastAutomationScenarioViewV2SkeletonLoaderSignature> {
  get stepRows(): undefined[] {
    const count = this.args.stepRowCount ?? 4;

    return new Array(count).fill(undefined);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::ScenarioViewV2::SkeletonLoader': typeof ProjectSettingsDastAutomationScenarioViewV2SkeletonLoaderComponent;
  }
}
