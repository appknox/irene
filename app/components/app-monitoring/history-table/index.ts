// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import AmAppSyncModel from 'irene/models/am-app-sync';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface AppMonitoringDetailsTableSignature {
  Args: {
    amAppSyncs: DS.AdapterPopulatedRecordArray<AmAppSyncModel>;
  };
}

export default class AppMonitoringHistoryDetailsTableComponent extends Component<AppMonitoringDetailsTableSignature> {
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('appMonitoringModule.foundOn'),
        component: 'app-monitoring/history-table/date-found',
        width: 70,
      },
      {
        name: this.intl.t('appMonitoringModule.storeVersion'),
        component: 'app-monitoring/history-table/store-version',
        width: 200,
      },
      {
        name: this.intl.t('appMonitoringModule.scannedOnAppknox'),
        component: 'app-monitoring/history-table/scanned-status',
        width: 70,
        textAlign: 'center',
      },
      {
        name: this.intl.t('fileID'),
        component: 'app-monitoring/history-table/file-id',
        width: 40,
        textAlign: 'center',
      },
    ];
  }

  get amAppSyncs() {
    return this.args.amAppSyncs.toArray();
  }

  get hasNoAmAppSyncs() {
    return this.amAppSyncs.length < 1;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::HistoryTable': typeof AppMonitoringHistoryDetailsTableComponent;
  }
}
