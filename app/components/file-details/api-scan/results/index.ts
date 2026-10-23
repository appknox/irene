import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type Store from 'ember-data/store';
import type { EmberTableSort } from 'ember-table';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';

export interface FileDetailsApiScanResultsSignature {
  Args: { file: FileModel };
}

export default class FileDetailsApiScanResultsComponent extends Component<FileDetailsApiScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare apiScan: ApiScanService;
  @service declare store: Store;

  @tracked filterVulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.API;

  @tracked sorts = [{ isAscending: false, valuePath: 'computedRisk' }];

  @tracked knoxiqScan: KnoxiqScanModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsApiScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.apiScan.setFooterComponent(null, {});
    this.fetchKnoxiqScan.perform();
  }

  get useKnoxiqVulnerabilityTable() {
    return this.knoxiqScan?.apiStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED;
  }

  fetchKnoxiqScan = task(async () => {
    try {
      this.knoxiqScan = await waitForPromise(
        this.store.queryRecord('knoxiq-scan', {
          id: this.args.file.id,
          fileId: this.args.file.id,
        })
      );
    } catch {
      this.knoxiqScan = null;
    }
  });

  get tabItems() {
    return [
      {
        id: 'vulnerability-details',
        label: this.intl.t('vulnerabilityDetails'),
        route: 'authenticated.dashboard.file.api-scan.results',
        currentWhen: 'authenticated.dashboard.file.api-scan.results',
      },
    ];
  }

  get columns() {
    return [
      {
        name: this.intl.t('impact'),
        valuePath: 'computedRisk',
        component: 'file-details/vulnerability-analysis/impact',
        width: 50,
        textAlign: 'center',
      },
      {
        name: this.intl.t('title'),
        width: 250,
        valuePath: 'vulnerability.name',
        isSortable: false,
      },
    ];
  }

  @action
  updateAnalysesSorts(sorts: EmberTableSort[]) {
    this.sorts = sorts;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::ApiScan::Results': typeof FileDetailsApiScanResultsComponent;
  }
}
