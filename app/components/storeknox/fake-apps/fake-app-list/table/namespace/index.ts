import Component from '@glimmer/component';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableNamespaceSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableNamespaceComponent extends Component<StoreknoxFakeAppsFakeAppListTableNamespaceSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Namespace': typeof StoreknoxFakeAppsFakeAppListTableNamespaceComponent;
  }
}
