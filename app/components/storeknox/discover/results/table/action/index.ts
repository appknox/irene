import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';
import MeService from 'irene/services/me';

interface LimitOffset {
  limit: number;
  offset: number;
}

export default class StoreknoxDiscoverResultsTableActionComponent extends Component {
  @service declare me: MeService;

  get isAdmin() {
    return this.me.org?.is_admin;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::Discover::Results::Table::Action': typeof StoreknoxDiscoverResultsTableActionComponent;
  }
}
