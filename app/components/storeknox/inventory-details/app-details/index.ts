import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import type { Owner } from '@ember/test-helpers/build-owner';
import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import parseError from 'irene/utils/parse-error';
import { tracked } from 'tracked-built-ins';
import type SkAppModel from 'irene/models/sk-app';

export default class StoreknoxInventoryDetailsAppDetailsComponent extends Component {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked skApp: SkAppModel | null = null;

  constructor(owner: Owner, args: object) {
    super(owner, args);

    this.fetchSkApp.perform();
  }

  get appDetailsInfo() {
    return [
      {
        title: this.intl.t('storeknox.developer'),
        value: this.skApp?.appMetadata.dev_name,
      },
      {
        title: this.intl.t('emailId'),
        value: this.skApp?.appMetadata.dev_email,
      },
      {
        title: this.intl.t('storeknox.addedToInventoryOn'),
        value: dayjs(this.skApp?.addedOn).format('DD, MMM YYYY'),
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

  fetchSkApp = task(async () => {
    try {
      await this.store.query('sk-app', {});
      const skApp = await this.store.findRecord('sk-app', 138);

      this.skApp = skApp;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('somethingWentWrong')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails': typeof StoreknoxInventoryDetailsAppDetailsComponent;
  }
}
