import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';
import type RouterService from '@ember/routing/router-service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export default class PrivacyModuleAppListTableComponent extends Component {
  @service declare intl: IntlService;
  @service declare router: RouterService;

  @tracked limit = 10;
  @tracked offset = 0;

  get loadingMockData() {
    return [1, 2, 3, 4].map((d) => ({ [d]: d }));
  }

  get isFetchingPrivacyApps() {
    return false;
  }

  get columns() {
    return [
      {
        name: this.intl.t('platform'),
        component: 'privacy-module/app-list/table/platform' as const,
        width: 70,
      },
      {
        name: this.intl.t('application'),
        component: 'privacy-module/app-list/table/application' as const,
        textAlign: 'left',
        width: 200,
      },
      {
        name: this.intl.t('version'),
        valuePath: 'version',
        textAlign: 'left',
        width: 100,
      },
      {
        name: 'Last Scanned On',
        component: 'privacy-module/app-list/table/last-scanned' as const,
        textAlign: 'center',
        width: 100,
      },
      {
        name: this.intl.t('action'),
        component: 'privacy-module/app-list/table/action' as const,
        textAlign: 'center',
        width: 70,
      },
    ];
  }

  get tableData() {
    return [
      {
        platform: ENUMS.PLATFORM.IOS,
        packageName: 'mfva.invoice.maker',
        fileName: 'MFVA',
        version: '8.1123123',
        lastScannedOn: '28 Nov 2024',
        fileIconUrl:
          'https://appknox-production-public.s3.amazonaws.com/96a22e6f-d1ed-445d-a6a3-ffa008cca7ea.png',
      },
      {
        platform: ENUMS.PLATFORM.ANDROID,
        packageName: 'com.shellasia.android',
        fileName: 'Facebook',
        version: '12.23123',
        lastScannedOn: '21 Nov 2024',
        fileIconUrl:
          'https://appknox-production-public.s3.amazonaws.com/2c701c61-a0c1-4caa-b2d6-7a93a9dbdfd5.png',
      },
      {
        platform: ENUMS.PLATFORM.IOS,
        packageName: 'com.shellasia.android',
        fileName: 'Instagram',
        version: '901881909120939213',
        lastScannedOn: '20 Nov 2024',
        fileIconUrl:
          'https://appknox-production-public.s3.amazonaws.com/dbdfc8d6-c99d-4cea-b469-d2648ef7effc.png',
      },
    ];
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    console.log(args);
  }

  @action onRowItemClick() {
    this.router.transitionTo(
      'authenticated.dashboard.privacy-module.app-details.index',
      87892
    );
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppList::Table': typeof PrivacyModuleAppListTableComponent;
  }
}
