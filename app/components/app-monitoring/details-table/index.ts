// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import { DS } from 'ember-data';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import AmAppRecordModel from 'irene/models/am-app-record';
import AmAppModel from 'irene/models/am-app';
import { action } from '@ember/object';

interface LimitOffset {
  limit: number;
  offset: number;
}

type AmAppRecordModelArray =
  DS.AdapterPopulatedRecordArray<AmAppRecordModel> & {
    meta: { count: number };
  };

interface AppMonitoringDetailsTableSignature {
  Args: {
    amApp: AmAppModel | null;
  };
}

export default class AppMonitoringDetailsTableComponent extends Component<AppMonitoringDetailsTableSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked amAppRecordsData: AmAppRecordModel[] = [];
  @tracked amAppRecordsTotalCount = 0;
  @tracked limit = 50;
  @tracked offset = 0;

  constructor(
    owner: unknown,
    args: AppMonitoringDetailsTableSignature['Args']
  ) {
    super(owner, args);
    this.fetchAmAppRecords.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('appMonitoringModule.storeVersion'),
        component: 'app-monitoring/details-table/store-version',
        width: 200,
      },
      {
        name: this.intl.t('country'),
        component: 'app-monitoring/details-table/country',
        width: 20,
        textAlign: 'center',
      },
    ];
  }

  get amApp() {
    return this.args.amApp;
  }

  get fixTableHeight() {
    return this.amAppRecordsData.length > 10;
  }

  get hasNoAmAppVersions() {
    return this.amAppRecordsData.length < 1;
  }

  get showPendingStateLoader() {
    return (
      this.hasNoAmAppVersions && this.amApp?.isPending && this.amApp.isActive
    );
  }

  // Table Actions
  @action goToPage(args: LimitOffset) {
    const { limit, offset } = args;

    this.limit = limit;
    this.offset = offset;

    this.fetchAmAppRecords.perform();
  }

  @action onItemPerPageChange(args: LimitOffset) {
    const { limit } = args;
    const offset = 0;

    this.limit = limit;
    this.offset = offset;

    this.fetchAmAppRecords.perform();
  }

  @action
  reloadAmAppRecords() {
    this.fetchAmAppRecords.perform();
  }

  fetchAmAppRecords = task(async () => {
    const amAppId = this.amApp?.id;

    if (amAppId) {
      const amAppRecordsData = (await this.store.query('am-app-record', {
        amAppId,
        limit: this.limit,
        offset: this.offset,
      })) as AmAppRecordModelArray;

      this.amAppRecordsData = amAppRecordsData.toArray();
      this.amAppRecordsTotalCount = amAppRecordsData.meta.count;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::DetailsTable': typeof AppMonitoringDetailsTableComponent;
  }
}
