import Component from '@glimmer/component';

export default class ProjectSettingsDastAutomationAutomationSettingsScanWindowSkeletonLoaderComponent extends Component {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::DastAutomation::AutomationSettings::ScanWindow::SkeletonLoader': typeof ProjectSettingsDastAutomationAutomationSettingsScanWindowSkeletonLoaderComponent;
  }
}
