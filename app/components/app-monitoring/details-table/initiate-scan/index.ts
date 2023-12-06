// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';
import Component from '@glimmer/component';

import AmAppRecordModel from 'irene/models/am-app-record';
import AmAppVersionModel from 'irene/models/am-app-version';

interface AppMonitoringDetailsTableActionSignature {
  Args: {
    storeVersionInfo: {
      version: DS.PromiseObject<AmAppVersionModel>;
      versionRecords: AmAppRecordModel[] | undefined;
    };
  };
}

export default class AppMonitoringDetailsTableActionComponent extends Component<AppMonitoringDetailsTableActionSignature> {
  get amAppVersion() {
    return this.args.storeVersionInfo.version;
  }
}
