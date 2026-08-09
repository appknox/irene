import Component from '@glimmer/component';
import type { AkIconVariantType } from 'ak-icons';

export interface OrganizationSettingsPanelHeaderSignature {
  Element: HTMLDivElement;

  Args: {
    iconName?: AkIconVariantType;
    description?: string;
  };

  Blocks: {
    title?: [];
    action?: [];
  };
}

export default class OrganizationSettingsPanelHeaderComponent extends Component<OrganizationSettingsPanelHeaderSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Organization::SettingsPanelHeader': typeof OrganizationSettingsPanelHeaderComponent;
    'organization/settings-panel-header': typeof OrganizationSettingsPanelHeaderComponent;
  }
}
