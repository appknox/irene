import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class StoreknoxInventoryDetailsAppDetailsVaResultsComponent extends Component {
  get vaResults() {
    return {
      critical: 50,
      high: 10,
      medium: 15,
      low: 25,
      passed: 30,
    };
  }

  get vaResultsCategories() {
    return Object.keys(this.vaResults) as Array<
      'medium' | 'critical' | 'high' | 'low' | 'passed'
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
