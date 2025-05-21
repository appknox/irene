import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';

interface FileDetailsDynamicScanResultsCoverageTableStatusHeaderSignature {
  Args: {
    onStatusChange: (status: number) => void;
    selectedStatus: number;
  };
}

export default class FileDetailsDynamicScanResultsCoverageTableStatusHeaderComponent extends Component<FileDetailsDynamicScanResultsCoverageTableStatusHeaderSignature> {
  @service declare intl: IntlService;

  @tracked anchorRef: HTMLElement | null = null;
  @tracked selectedStatus: number = -1;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanResultsCoverageTableStatusHeaderSignature['Args']
  ) {
    super(owner, args);

    this.selectedStatus = args.selectedStatus;
  }

  get statusOptions() {
    return [
      { key: this.intl.t('all'), value: -1 },
      {
        key: this.intl.t('scanCoverage.visited'),
        value: ENUMS.SCAN_COVERAGE_SCREEN_STATUS.VISITED,
      },
      {
        key: this.intl.t('scanCoverage.notVisited'),
        value: ENUMS.SCAN_COVERAGE_SCREEN_STATUS.NOT_VISITED,
      },
    ];
  }

  get filterApplied() {
    return this.selectedStatus > -1;
  }

  @action handleClick(event: MouseEvent) {
    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action handleOptionsClose() {
    this.anchorRef = null;
  }

  @action selectStatus(value: number) {
    this.selectedStatus = value;
    this.anchorRef = null;

    this.args.onStatusChange(value);
  }

  @action clearFilter() {
    this.selectedStatus = -1;
    this.anchorRef = null;

    this.args.onStatusChange(-1);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Results::CoverageTable::StatusHeader': typeof FileDetailsDynamicScanResultsCoverageTableStatusHeaderComponent;
  }
}
