import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import type { PaginationProviderActionsArgs } from 'irene/components/ak-pagination-provider';

export default class PrivacyModuleAppDetailsPiiComponent extends Component {
  @service('notifications') declare notify: NotificationService;

  @tracked limit = 10;
  @tracked offset = 0;
  @tracked selectedPii = null;

  @tracked aiDrawerOpen = false;

  @tracked feature = false;
  @tracked owner = false;

  get columns() {
    return [
      {
        name: 'PII Category',
        component: 'privacy-module/app-details/pii/table/category',
        width: 70,
      },
      {
        name: 'PII Data Found',
        component: 'privacy-module/app-details/pii/table/data-found',
        width: 180,
      },
    ];
  }

  get tableData() {
    return [
      {
        categoryName: 'CREDIT_CARD',
        dataFound: [
          {
            value: '4082 4323 4533 2335',
            source: 'APP BINARY',
          },
          {
            value: '4544 6755 4532 9809',
            source: 'APP BINARY',
          },
          {
            value: '9650 0959 0002 0009',
            source: 'API',
            urls: [
              'https://pushy-saxophone.name',
              'https://far-integrity.org',
              'https://assured-eyeliner.org',
            ],
          },
          {
            value: '4124 4674 7654 7778',
            source: 'API',
            urls: [
              'https://pushy-saxophone.name',
              'https://far-integrity.org',
              'https://assured-eyeliner.org',
            ],
          },
        ],
      },
      {
        categoryName: 'EMAIL_ADDRESS',
        dataFound: [
          {
            value: 'raghu@appnknox.com',
            source: 'API',
          },
        ],
      },
      {
        categoryName: 'IP_ADDRESS',
        dataFound: [
          {
            value: '127.454.345.12',
            source: 'APP BINARY',
          },
        ],
      },
      {
        categoryName: 'IN_AADHAAR',
        dataFound: [
          {
            value: '1234 8976 5644 7865',
            source: 'APP BINARY',
          },
          {
            value: '7896 1234 7766 5678',
            source: 'APP BINARY',
          },
          {
            value: '4567 9861 2123 1234',
            source: 'APP BINARY',
          },
        ],
      },
      {
        categoryName: 'PERSON',
        dataFound: [
          {
            value: 'RAGHU',
            source: 'APP BINARY',
          },
        ],
      },
      {
        categoryName: 'PHONE_NUMBER',
        dataFound: [
          {
            value: '(91) 944 342 30 20',
            source: 'APP BINARY',
          },
        ],
      },
    ];
  }

  @action goToPage(args: PaginationProviderActionsArgs) {
    console.log(args);
  }

  @action openPiiDetailsDrawer({ rowValue }: any) {
    this.selectedPii = rowValue;
  }

  @action closePiiDetailsDrawer() {
    this.selectedPii = null;
  }

  @action openAIDrawer() {
    this.aiDrawerOpen = true;
  }

  @action closeAiDrawer() {
    this.aiDrawerOpen = false;
  }

  get piiIsSelected() {
    return !!this.selectedPii;
  }

  get selectedPiiData() {
    return this.selectedPii?.dataFound[0];
  }

  get multiplePiiData() {
    return this.selectedPii?.dataFound?.length > 1;
  }

  @action
  handleCopySuccess(event: ClipboardJS.Event) {
    this.notify.info('URL Copied');

    event.clearSelection();
  }

  @action
  handleCopyError() {
    this.notify.error('Please Try Again');
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'PrivacyModule::AppDetails::Pii': typeof PrivacyModuleAppDetailsPiiComponent;
  }
}
