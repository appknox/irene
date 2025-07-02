import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type SkAppModel from 'irene/models/sk-app';

interface StoreknoxInventoryArchivedAppsTableArchivedDateSignature {
  Args: {
    loading?: boolean;
    skApp?: SkAppModel;
  };
}

export default class StoreknoxInventoryArchivedAppsTableArchivedDateComponent extends Component<StoreknoxInventoryArchivedAppsTableArchivedDateSignature> {
  get archivedDate() {
    return dayjs(this.args.skApp?.archivedOn).format('MMMM D, YYYY');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'storeknox/inventory/archived-apps/table/archived-date': typeof StoreknoxInventoryArchivedAppsTableArchivedDateComponent;
  }
}
