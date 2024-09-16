import Component from '@glimmer/component';
import Store from '@ember-data/store';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import MeService from 'irene/services/me';
import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';
import SkDiscoveryResultService from 'irene/services/sk-discovery-result';

interface StoreknoxDiscoverResultsTableActionSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverResultsTableActionComponent extends Component<StoreknoxDiscoverResultsTableActionSignature> {
  @service declare me: MeService;
  @service declare store: Store;
  @service declare skDiscoveryResult: SkDiscoveryResultService;

  get isAdmin() {
    return this.me.org?.is_admin;
  }

  @action
  addToInventory(ulid: string) {
    this.skDiscoveryResult.addToInventory.perform(ulid);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table::Action': typeof StoreknoxDiscoverResultsTableActionComponent;
  }
}
