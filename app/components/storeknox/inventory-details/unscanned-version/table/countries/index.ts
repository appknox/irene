import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import AmAppRecordModel from 'irene/models/am-app-record';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';
import SkAppVersionModel from 'irene/models/sk-app-version';

interface AppMonitoringVersionTableCountriesSignature {
  Args: {
    skAppVersion: SkAppVersionModel;
  };
}

export default class AppMonitoringVersionTableCountriesComponent extends Component<AppMonitoringVersionTableCountriesSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked storeRecords: AmAppRecordModel[] = [];
  @tracked countryCodes: string[] = [];

  constructor(
    owner: unknown,
    args: AppMonitoringVersionTableCountriesSignature['Args']
  ) {
    super(owner, args);

    this.compileVersionCountryCodes.perform();
  }

  get skAppVersion() {
    return this.args.skAppVersion;
  }

  get showEmptyCountryList() {
    return this.countryCodes.length < 1;
  }

  get countryNamesMap(): Record<string, string> {
    return COUNTRY_NAMES_MAP;
  }

  compileVersionCountryCodes = task(async () => {
    const storeInstances = this.skAppVersion?.skStoreInstances.slice();

    this.countryCodes = storeInstances.map((si) => si.countryCode);
  });
}
