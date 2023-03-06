// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import AmAppVersionModel from 'irene/models/am-app-version';
import { inject as service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface AppMonitoringDetailsTableSignature {
  Args: {
    amAppVersions: DS.AdapterPopulatedRecordArray<AmAppVersionModel>;
  };
}

export default class AppMonitoringDetailsTableComponent extends Component<AppMonitoringDetailsTableSignature> {
  @service declare intl: IntlService;

  get columns() {
    return [
      {
        name: this.intl.t('appMonitoringModule.storeVersion'),
        component: 'app-monitoring/details-table/store-version',
        width: 200,
      },
      {
        name: this.intl.t('appMonitoringModule.countryCode'),
        component: 'app-monitoring/details-table/country-code',
        width: 10,
        textAlign: 'center',
      },
      {
        name: this.intl.t('appMonitoringModule.initiateScan'),
        component: 'app-monitoring/details-table/initiate-scan',
        width: 10,
        textAlign: 'center',
      },
      {
        name: this.intl.t('action'),
        component: 'app-monitoring/details-table/action',
        width: 10,
        textAlign: 'center',
      },
    ];
  }

  get amAppVersions() {
    return this.args.amAppVersions.toArray();
  }

  get hasNoAmAppVersions() {
    return this.amAppVersions.length < 1;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::DetailsTable': typeof AppMonitoringDetailsTableComponent;
  }
}
