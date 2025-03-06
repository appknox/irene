import { service } from '@ember/service';
import Component from '@glimmer/component';
import type IntlService from 'ember-intl/services/intl';

export default class StoreknoxInventoryDetailsAppDetailsVaResultsLoadingResultsComponent extends Component {
  @service declare intl: IntlService;

  get vaResultsData() {
    return [
      this.intl.t('version'),
      this.intl.t('versionCodeTitleCase'),
      this.intl.t('storeknox.lastScannedDate'),
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::LoadingResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsLoadingResultsComponent;
  }
}
