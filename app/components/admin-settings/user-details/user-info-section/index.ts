import Component from '@glimmer/component';

export interface UserInfoProps {
  title: string;
  value: string;
}

interface AdminSettingsUserDetailsUserInfoSectionSignature {
  Element: HTMLElement;
  Args: {
    userDetails: UserInfoProps[];
  };
  Blocks: {
    default: [];
  };
}

export default class AdminSettingsUserDetailsUserInfoSectionComponent extends Component<AdminSettingsUserDetailsUserInfoSectionSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::UserInfoSection': typeof AdminSettingsUserDetailsUserInfoSectionComponent;
  }
}
