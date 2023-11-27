// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

import Component from '@glimmer/component';

// TODO: Remove country names map in irene/utils/constants
import AmAppRecordModel from 'irene/models/am-app-record';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringDetailsTableCountrySignature {
  Args: {
    storeVersionInfo: {
      version: DS.PromiseObject<AmAppVersionModel>;
      versionRecords: AmAppRecordModel[] | undefined;
    };
  };
}

export default class AppMonitoringDetailsTableCountryComponent extends Component<AppMonitoringDetailsTableCountrySignature> {
  get countryCodes() {
    return this.args.storeVersionInfo.versionRecords
      ?.map((record) => record.get('amAppStoreInstance').get('countryCode'))
      .join(', ');
  }
}
