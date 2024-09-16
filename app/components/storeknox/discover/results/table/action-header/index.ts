import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

import MeService from 'irene/services/me';
import SkDiscoverySearchResultModel from 'irene/models/sk-discovery-result';

interface StoreknoxDiscoverResultsTableActionHeaderSignature {
  Args: {
    data: SkDiscoverySearchResultModel;
  };
}

export default class StoreknoxDiscoverResultsTableActionHeaderComponent extends Component<StoreknoxDiscoverResultsTableActionHeaderSignature> {
  @service declare me: MeService;
  @service declare intl: IntlService;

  get isAdmin() {
    return this.me.org?.is_admin;
  }

  get tooltipText() {
    if (this.isAdmin) {
      return this.intl.t('storeknox.actionHeaderInfoOwner');
    }

    return this.intl.t('storeknox.actionHeaderInfo');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table::ActionHeader': typeof StoreknoxDiscoverResultsTableActionHeaderComponent;
  }
}
