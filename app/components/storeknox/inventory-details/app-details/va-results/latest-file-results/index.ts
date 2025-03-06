import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import type IntlService from 'ember-intl/services/intl';

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

  get coreProjectLatestVersion() {
    return this.args.coreProjectLatestVersion;
  }

  get latestVersionId() {
    return this.coreProjectLatestVersion?.get('id');
  }

  // Latest file related to project on Appknox
  get vaResultsRiskInfo() {
    return {
      critical: this.coreProjectLatestVersion?.get('countRiskCritical'),
      high: this.coreProjectLatestVersion?.get('countRiskHigh'),
      medium: this.coreProjectLatestVersion?.get('countRiskMedium'),
      low: this.coreProjectLatestVersion?.get('countRiskLow'),
      passed: this.coreProjectLatestVersion?.get('countRiskNone'),
      untested: this.coreProjectLatestVersion?.get('countRiskUnknown'),
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
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Storeknox::InventoryDetails::AppDetails::VaResults::LatestFileResults': typeof StoreknoxInventoryDetailsAppDetailsVaResultsLatestFileResultsComponent;
  }
}
