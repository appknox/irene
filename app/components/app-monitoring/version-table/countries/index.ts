/* eslint-disable ember/use-ember-data-rfc-395-imports */
import DS from 'ember-data';

import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import Store from '@ember-data/store';

import AmAppVersionModel from 'irene/models/am-app-version';
import AmAppRecordModel from 'irene/models/am-app-record';
import { tracked } from '@glimmer/tracking';
import parseError from 'irene/utils/parse-error';

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

  constructor(
    owner: unknown,
    args: AppMonitoringVersionTableCountriesSignature['Args']
  ) {
    super(owner, args);

    this.fetchAmAppVersionRecords.perform();
  }

  get countryCodes() {
    const countryCodeList = this.storeRecords
      ?.map((record) => record.get('amAppStoreInstance').get('countryCode'))
      .filter(Boolean);

    return countryCodeList.length >= 1 ? countryCodeList.join(', ') : '-';
  }

  fetchAmAppVersionRecords = task(async () => {
    const amAppVersionId = this.args.amAppVersion?.id;

    try {
      const amAppRecords = (await this.store.query('am-app-record', {
        amAppVersionId,
      })) as AmAppRecordModelArray;

      this.storeRecords = amAppRecords.toArray();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}
