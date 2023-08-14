import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';

import FileModel from 'irene/models/file';
import UnknownAnalysisStatusModel from 'irene/models/unknown-analysis-status';

interface FileCompareFileOverviewChartSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel | null;
    profileId: string | number;
  };
}

export default class FileCompareFileOverviewChartComponent extends Component<FileCompareFileOverviewChartSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;

  @tracked unknownAnalysisStatus: UnknownAnalysisStatusModel | null = null;

  constructor(
    owner: unknown,
    args: FileCompareFileOverviewChartSignature['Args']
  ) {
    super(owner, args);

    this.getUnknownAnalysisStatus.perform();
  }

  get file() {
    return this.args.file;
  }

  get chartOptions() {
    return this.file?.echartPieChartOptions || {};
  }

  get chartLegendData() {
    if (!this.unknownAnalysisStatus?.status) {
      return this.file?.severityLevelCounts.filter(
        (severity) => severity.severityType !== 'untested'
      );
    }

    return this.file?.severityLevelCounts;
  }

  getUnknownAnalysisStatus = task(async () => {
    const unknownAnalysisStatus = await this.store.queryRecord(
      'unknown-analysis-status',
      {
        id: this.args.profileId,
      }
    );

    this.unknownAnalysisStatus = unknownAnalysisStatus;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileCompare::FileOverview::Chart': typeof FileCompareFileOverviewChartComponent;
  }
}
