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
import AmAppVersionModel from 'irene/models/am-app-version';

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
  @tracked groupedStoreVersions: Record<string, AmAppRecordModel[]> = {};
  @tracked storeVersionsToDisplay: {
    version: DS.PromiseObject<AmAppVersionModel>;
    versionRecords: AmAppRecordModel[] | undefined;
  }[] = [];
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
        name: 'App status',
        component: 'app-monitoring/details-table/scan-status',
        width: 200,
        textAlign: 'center',
      },
      {
        name: this.intl.t('countries'),
        component: 'app-monitoring/details-table/country',
        width: 100,
        textAlign: 'center',
      },
      {
        name: 'Action',
        component: 'app-monitoring/details-table/initiate-scan',
        width: 80,
        textAlign: 'center',
      },
    ];
  }

  get amApp() {
    return this.args.amApp;
  }

  get hasNoAmAppVersions() {
    return this.storeVersionsToDisplay.length < 1;
  }

  get showPendingStateLoader() {
    return (
      this.hasNoAmAppVersions && this.amApp?.isPending && this.amApp.isActive
    );
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

      const groupedVersions: Record<number | string, AmAppRecordModel[]> = {};

      amAppRecordsData.forEach((record) => {
        const recordVersion = record.amAppVersion.get('id') as string;

        if (!groupedVersions[recordVersion]) {
          groupedVersions[recordVersion] = [];
        }

        groupedVersions[recordVersion]?.push(record);
      });

      this.storeVersionsToDisplay = Object.keys(groupedVersions)
        .map((id) => ({
          version: this.store.findRecord('am-app-version', id),
          versionRecords: groupedVersions[id],
        }))
        .sort((a) => {
          if (
            a.version.get('comparableVersion') &&
            a.version.get('latestFile')?.get('id')
          ) {
            return 1;
          }

          return -1;
        });
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AppMonitoring::DetailsTable': typeof AppMonitoringDetailsTableComponent;
  }
}
