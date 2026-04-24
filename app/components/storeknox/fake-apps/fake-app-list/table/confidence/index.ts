import Component from '@glimmer/component';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableConfidenceSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableConfidenceComponent extends Component<StoreknoxFakeAppsFakeAppListTableConfidenceSignature> {}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Confidence': typeof StoreknoxFakeAppsFakeAppListTableConfidenceComponent;
  }
}
