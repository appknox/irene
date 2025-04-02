import Component from '@glimmer/component';

interface SAdminSettingsUserDetailsSectionHeaderSignature {
  Element: HTMLElement;
  Args: {
    color?: 'default' | 'white';
  };
  Blocks: {
    headerCTA?: [];
    default: [];
  };
}

export default class SAdminSettingsUserDetailsSectionHeaderComponent extends Component<SAdminSettingsUserDetailsSectionHeaderSignature> {
  get color() {
    return this.args.color || 'default';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AdminSettings::UserDetails::SectionHeader': typeof SAdminSettingsUserDetailsSectionHeaderComponent;
  }
}
