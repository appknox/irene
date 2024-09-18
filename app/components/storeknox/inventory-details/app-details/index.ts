import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component {
  get appDetailsInfo() {
    return [
      {
        title: 'Developer',
        value: 'Test Information Technology International',
      },
      {
        title: 'Email ID',
        value: 'test@email.com',
      },
      {
        title: 'Added to Inventory on',
        value: dayjs().format('DD, MMM YYYY'),
      },
    ];
  }

  get vaResultsData() {
    return [
      {
        title: 'Version',
        value: '7.1.4',
      },
      {
        title: 'Version Code',
        value: '1605631525',
      },
      {
        title: 'Last Scanned Date',
        value: dayjs().format('DD MMM YYYY'),
      },
    ];
  }

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
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
