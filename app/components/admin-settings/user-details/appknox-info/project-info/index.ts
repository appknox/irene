import Component from '@glimmer/component';
import OrganizationProjectModel from 'irene/models/organization-project';

export interface AdminSettingsUserDetailsAppknoxInfoProjectInfoComponentSignature {
  Args: {
    project: OrganizationProjectModel;
  };
  Element: HTMLElement;
}

export default class AdminSettingsUserDetailsAppknoxInfoProjectInfoComponent extends Component<AdminSettingsUserDetailsAppknoxInfoProjectInfoComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'admin-settings/user-details/appknox-info/project-info': typeof AdminSettingsUserDetailsAppknoxInfoProjectInfoComponent;
  }
}
