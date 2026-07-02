import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import type { FakeAppTableRowData } from 'irene/components/storeknox/fake-apps/fake-app-list/list';

export interface StoreknoxFakeAppsFakeAppListTableLogoSignature {
  Args: {
    data: FakeAppTableRowData;
    loading?: boolean;
  };
}

export default class StoreknoxFakeAppsFakeAppListTableLogoComponent extends Component<StoreknoxFakeAppsFakeAppListTableLogoSignature> {
  @tracked showFallback = false;

  get noSrc() {
    return !this.args.data.appLogoUrl;
  }

  @action
  handleImageError() {
    this.showFallback = true;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::FakeAppList::Table::Logo': typeof StoreknoxFakeAppsFakeAppListTableLogoComponent;
  }
}
