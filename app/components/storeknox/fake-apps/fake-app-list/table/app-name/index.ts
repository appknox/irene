import Component from '@glimmer/component';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableAppNameSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableAppNameComponent extends Component<StoreknoxFakeAppsFakeAppListTableAppNameSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::AppName': typeof StoreknoxFakeAppsFakeAppListTableAppNameComponent;
  }
}
