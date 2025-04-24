import Component from '@glimmer/component';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryArchivedAppsTableArchivedBySignature {
  Args: {
    skApp?: SkAppModel;
    loading?: boolean;
  };
}

export default class StoreknoxInventoryArchivedAppsTableArchivedByComponent extends Component<StoreknoxInventoryArchivedAppsTableArchivedBySignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/archived-apps/table/archived-by': typeof StoreknoxInventoryArchivedAppsTableArchivedByComponent;
  }
}
