import Component from '@glimmer/component';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableStoreSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableStoreComponent extends Component<StoreknoxFakeAppsFakeAppListTableStoreSignature> {
  get storeIconComponent() {
    if (this.args.data.skFakeApp.isAndroidStore) {
      return 'ak-svg/playstore-logo';
    }

    if (this.args.data.skFakeApp.isAptoideStore) {
      return 'ak-svg/apptoide-icon';
    }

    return 'ak-svg/appstore-logo';
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Store': typeof StoreknoxFakeAppsFakeAppListTableStoreComponent;
  }
}
