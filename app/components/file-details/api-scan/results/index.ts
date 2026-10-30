import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { waitForPromise } from '@ember/test-waiters';
import type { EmberTableSort } from 'ember-table';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type FileModel from 'irene/models/file';
import type ApiScanService from 'irene/services/api-scan';
import type KnoxiqScanModel from 'irene/models/knoxiq-scan';
import type KnoxiqScanService from 'irene/services/knoxiq-scan';
import type MeService from 'irene/services/me';

export interface FileDetailsApiScanResultsSignature {
  Args: { file: FileModel };
}

export default class FileDetailsApiScanResultsComponent extends Component<FileDetailsApiScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare apiScan: ApiScanService;
  @service('knoxiq-scan') declare knoxiqScanService: KnoxiqScanService;
  @service declare me: MeService;

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

    if (this.canFetchKnoxiqData) {
      this.fetchKnoxiqScan.perform();
    }
  }

  /** Mirrors FileDetailsComponent#isKnoxiqEnabled — resolved from the file's own org. */
  get isKnoxiqEnabled() {
    if (this.args.file.isLegacyKnoxIQScan) {
      return false;
    }

    return Boolean(
      this.args.file.project?.get('organization')?.get('aiFeatures')?.knoxiq
    );
  }

  /** Lets a superuser fetch results for a client file even though their own org has it off. */
  get canFetchKnoxiqData() {
    return (
      this.isKnoxiqEnabled ||
      (Boolean(this.me.org?.is_superuser) &&
        Boolean(this.args.file.isKnoxiqEnabled))
    );
  }

  get useKnoxiqVulnerabilityTable() {
    return this.knoxiqScan?.apiStatus === ENUMS.KNOXIQ_SCAN_STATUS.COMPLETED;
  }

  fetchKnoxiqScan = task(async () => {
    try {
      this.knoxiqScan = await waitForPromise(
        this.knoxiqScanService.fetch(this.args.file.id)
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
