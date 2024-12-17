import Component from '@glimmer/component';
import dayjs from 'dayjs';

export default class StoreknoxInventoryDetailsBrandAbuseComponent extends Component {
  get brandAbuseInfoData() {
    return [
      {
        title: 'Threat Detected',
        value: 'Spoofing',
      },
      {
        title: 'Detected on',
        value: dayjs().format('DD, MMM YYYY'),
      },
      {
        title: 'No of Downloads',
        value: '1500 Download',
      },
      {
        title: 'Publisher',
        value: 'XYZ Teams',
      },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::BrandAbuse': typeof StoreknoxInventoryDetailsBrandAbuseComponent;
  }
}
