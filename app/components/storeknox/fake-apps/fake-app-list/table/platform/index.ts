import Component from '@glimmer/component';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTablePlatformSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTablePlatformComponent extends Component<StoreknoxFakeAppsFakeAppListTablePlatformSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Platform': typeof StoreknoxFakeAppsFakeAppListTablePlatformComponent;
  }
}
