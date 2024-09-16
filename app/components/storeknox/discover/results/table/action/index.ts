import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import IntlService from 'ember-intl/services/intl';

import type MeService from 'irene/services/me';
import type SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';
import type SkDiscoveryResultService from 'irene/services/sk-discovery-result';

interface StoreknoxDiscoverResultsTableActionSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
    loading: boolean;
  };
}

export default class StoreknoxDiscoverResultsTableActionComponent extends Component<StoreknoxDiscoverResultsTableActionSignature> {
  @service declare me: MeService;
  @service declare skDiscoveryResult: SkDiscoveryResultService;
  @service declare intl: IntlService;

  get isAdmin() {
    return this.me.org?.is_admin;
  }

  get iconValue() {
    const isApproved = this.args.data.approved;

    return {
      className: isApproved ? 'already-exist-icon' : 'requested-icon',
      iconName: isApproved ? 'inventory-2' : 'schedule-send',
      tooltipText: this.intl.t(
        isApproved
          ? 'storeknox.appAlreadyExists'
          : 'storeknox.appAlreadyRequested'
      ),
    };
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
