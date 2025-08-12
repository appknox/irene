import Component from '@glimmer/component';
import type SkOrganizationModel from 'irene/models/sk-organization';

export interface StoreknoxInventorySettingsDrawerSignature {
  Element: HTMLElement;
  Args: {
    skOrg: SkOrganizationModel | null;
    shouldShowSettingsDrawer: boolean;
    closeSettingsDrawer: () => void;
    onToggleAddToInventoryByDefault: (event: Event, checked?: boolean) => void;
    onToggleAutoDiscoveryEnabled: (event: Event, checked?: boolean) => void;
  };
}

export default class StoreknoxInventorySettingsDrawerComponent extends Component<StoreknoxInventorySettingsDrawerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Inventory::SettingsDrawer': typeof StoreknoxInventorySettingsDrawerComponent;
  }
}
