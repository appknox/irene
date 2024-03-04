/* eslint-disable ember/use-ember-data-rfc-395-imports */
import DS from 'ember-data';

import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';

import AmAppVersionModel from 'irene/models/am-app-version';
import AmAppRecordModel from 'irene/models/am-app-record';
import parseError from 'irene/utils/parse-error';
import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';

type AmAppRecordModelArray =
  DS.AdapterPopulatedRecordArray<AmAppRecordModel> & {
    meta: { count: number };
  };

interface AppMonitoringVersionTableCountriesSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
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

    this.fetchAmAppVersionRecords.perform();
  }

  get showEmptyCountryList() {
    return (
      !this.fetchAmAppVersionRecords.isRunning && this.countryCodes.length < 1
    );
  }

  get countryNamesMap(): Record<string, string> {
    return COUNTRY_NAMES_MAP;
  }

  fetchAmAppVersionRecords = task(async () => {
    const amAppVersionId = this.args.amAppVersion?.id;

    try {
      const amAppRecords = (await this.store.query('am-app-record', {
        amAppVersionId,
      })) as AmAppRecordModelArray;

      const records = amAppRecords.toArray();
      const countryCodes = [];

      for (let idx = 0; idx < records.length; idx++) {
        const record = records[idx];
        const storeInstance = await record?.get('amAppStoreInstance');
        const cc = storeInstance?.get('countryCode');

        if (cc?.trim()) {
          countryCodes.push(cc);
        }
      }

      this.countryCodes = countryCodes;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}
