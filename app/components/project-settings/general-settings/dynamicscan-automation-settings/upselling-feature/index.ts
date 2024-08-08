import Component from '@glimmer/component';

import styles from './index.scss';

export interface ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsUpsellingFeatureSignature {}

export default class ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsUpsellingFeatureComponent extends Component<ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsUpsellingFeatureSignature> {
  get classes() {
    return {
      linkTextClass: styles['link-text'],
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::GeneralSettings::DynamicscanAutomationSettings::UpsellingFeature': typeof ProjectSettingsGeneralSettingsDyanmicscanAutomationSettingsUpsellingFeatureComponent;
  }
}
