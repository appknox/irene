import Component from '@glimmer/component';

export default class StoreknoxFakeAppsItemCardComponent extends Component {
  exampleData = {
    appDetails: {
      url: 'https://apps.apple.com/us/app/keeta-food-delivery/id1662451643?uo=4',
      iconUrl:
        'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/45/d8/89/45d889f8-fa5d-e1b5-bf20-f14f307b4156/AppIcon-1x_U007emarketing-0-7-0-0-85-220-0.png/100x100bb.jpg',
      name: 'Shell SmartPay Puerto',
      packageId: 'com.shellsmartpayrico.ios',
      publisher: 'Shell Information Technology Pte Ltd',
      platform: 'apple' as const,
    },

    summary: {
      suspectedAppsCount: 13,
      suspectedAppsIconUrl: '/path/to/suspected-apps-icon.png',
    },

    breakdown: {
      brandAbuse: {
        count: 4,
        total: 13,
        percentage: 30.77,
      },
      fakeApp: {
        count: 9,
        total: 13,
        percentage: 69.23,
      },
    },
    lastMonitoringDate: '05, Feb 2025',
  };
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::FakeApps::ItemCard': typeof StoreknoxFakeAppsItemCardComponent;
  }
}
