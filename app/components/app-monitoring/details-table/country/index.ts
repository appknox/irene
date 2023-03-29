import Component from '@glimmer/component';

import { COUNTRY_NAMES_MAP } from 'irene/utils/constants';
import AmAppRecordModel from 'irene/models/am-app-record';

interface AppMonitoringDetailsTableCountrySignature {
  Args: {
    amAppRecord: AmAppRecordModel;
  };
}

export default class AppMonitoringDetailsTableCountryComponent extends Component<AppMonitoringDetailsTableCountrySignature> {
  get amAppRecord() {
    return this.args.amAppRecord;
  }

  get storeInstance() {
    return this.amAppRecord.get('amAppStoreInstance');
  }

  get countryName() {
    const countryCode = this.storeInstance
      ?.get('countryCode')
      ?.trim()
      .toUpperCase() as keyof typeof COUNTRY_NAMES_MAP;

    return COUNTRY_NAMES_MAP[countryCode] || countryCode || '-';
  }
}
