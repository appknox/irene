import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class StoreknoxInventoryDetailsAppDetailsVaResultsComponent extends Component {
  get vaResults() {
    const totalResultsCount = 130;

    return {
      critical: (50 / totalResultsCount) * 100,
      high: (10 / totalResultsCount) * 100,
      medium: (15 / totalResultsCount) * 100,
      low: (25 / totalResultsCount) * 100,
      passed: (30 / totalResultsCount) * 100,
    };
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsComponent;
  }
}
