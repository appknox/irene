import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import type IntlService from 'ember-intl/services/intl';

import type FileRiskModel from 'irene/models/file-risk';
import type SkInventoryAppModel from 'irene/models/sk-inventory-app';
import type FileModel from 'irene/models/file';

interface StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsSignature {
  Args: {
    skInventoryApp?: SkInventoryAppModel;
    coreProjectLatestVersion?: FileModel | null;
  };
}

export default class StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsComponent extends Component<StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsSignature> {
  @service declare intl: IntlService;

  @tracked corePrjLatestVersionRisk: FileRiskModel | null = null;

  constructor(
    owner: unknown,
    args: StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsSignature['Args']
  ) {
    super(owner, args);

    this.fetchFileRisk.perform();
  }

  get coreProjectLatestVersion() {
    return this.args.coreProjectLatestVersion;
  }

  get latestVersionId() {
    return this.coreProjectLatestVersion?.get('id');
  }

  // Latest file related to project on Appknox
  get vaResultsRiskInfo() {
    return {
      critical: this.corePrjLatestVersionRisk?.get('riskCountCritical'),
      high: this.corePrjLatestVersionRisk?.get('riskCountHigh'),
      medium: this.corePrjLatestVersionRisk?.get('riskCountMedium'),
      low: this.corePrjLatestVersionRisk?.get('riskCountLow'),
      passed: this.corePrjLatestVersionRisk?.get('riskCountPassed'),
      untested: this.corePrjLatestVersionRisk?.get('riskCountUnknown'),
    };
  }

  get vaResultsRiskInfoCategories() {
    return Object.keys(this.vaResultsRiskInfo) as Array<
      keyof typeof this.vaResultsRiskInfo
    >;
  }

  get vaResultsData() {
    return [
      {
        title: this.intl.t('version'),
        value: this.coreProjectLatestVersion?.get('version'),
      },
      {
        title: this.intl.t('versionCodeTitleCase'),
        value: this.coreProjectLatestVersion?.get('versionCode'),
      },
      {
        title: this.intl.t('storeknox.lastScannedDate'),
        value: dayjs(this.coreProjectLatestVersion?.get('createdOn')).format(
          'DD MMM YYYY'
        ),
      },
    ];
  }

  fetchFileRisk = task(async () => {
    if (this.coreProjectLatestVersion) {
      this.corePrjLatestVersionRisk = await waitForPromise(
        this.coreProjectLatestVersion.fetchFileRisk()
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::LatestFileResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsComponent;
  }
}
