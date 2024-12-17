import { action } from '@ember/object';
import Component from '@glimmer/component';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';

interface StoreknoxInventoryDetailsAppDetailsVaResultsSignature {
  Args: {
    app?: SkInventoryAppModel;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsSignature> {
  get coreProjectLatestVersion() {
    return this.args.app?.coreProjectLatestVersion;
  }

  get vaResults() {
    return {
      critical: this.coreProjectLatestVersion?.get('countRiskCritical'),
      high: this.coreProjectLatestVersion?.get('countRiskHigh'),
      medium: this.coreProjectLatestVersion?.get('countRiskMedium'),
      low: this.coreProjectLatestVersion?.get('countRiskLow'),
      passed: this.coreProjectLatestVersion?.get('countRiskNone'),
      untested: this.coreProjectLatestVersion?.get('countRiskUnknown'),
    };
  }

  get vaResultsCategories() {
    return Object.keys(this.vaResults) as Array<
      'medium' | 'critical' | 'high' | 'low' | 'passed' | 'untested'
    >;
  }

  @action getVaCategoryResultCount(category: keyof typeof this.vaResults) {
    return this.vaResults[category];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsComponent;
  }
}
