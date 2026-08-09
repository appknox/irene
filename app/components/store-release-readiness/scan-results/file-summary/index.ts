import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import type { AkIconVariantType } from 'ak-icons';

import ENUMS from 'irene/enums';
import type { AkIconColorVariant } from 'irene/components/ak-icon';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

export interface StoreReleaseReadinessScanResultsFileSummarySignature {
  Element: HTMLDivElement;
  Args: {
    scanData: StoreReleaseReadinessScanModel;
  };
}

interface HeaderAnalysisStatusDisplay {
  label: string;
  iconName: AkIconVariantType;
  iconColor: AkIconColorVariant;
}

export default class StoreReleaseReadinessScanResultsFileSummaryComponent extends Component<StoreReleaseReadinessScanResultsFileSummarySignature> {
  @service declare intl: IntlService;

  @tracked showMoreFileSummary = false;
  @tracked openViewReportDrawer = false;

  get appLogoSrc(): string {
    return this.args.scanData.iconUrl?.trim();
  }

  get showReportButton() {
    const scan = this.args.scanData;

    return scan.isCompleted || scan.isPartial;
  }

  get headerAnalysisStatusDisplay(): HeaderAnalysisStatusDisplay {
    const SCAN_STATUS = ENUMS.STORE_RELEASE_SCAN_STATUS;

    switch (this.args.scanData.status) {
      case SCAN_STATUS.FAILED:
        return {
          label: this.intl.t('failed'),
          iconName: 'cancel',
          iconColor: 'error',
        };

      case SCAN_STATUS.COMPLETED:
        return {
          label: this.intl.t('completed'),
          iconName: 'check-circle',
          iconColor: 'success',
        };

      case SCAN_STATUS.PARTIAL:
        return {
          label: this.intl.t('storeReleaseReadiness.partialStatus'),
          iconName: 'hourglass-top',
          iconColor: 'warn',
        };

      case SCAN_STATUS.IN_PROGRESS:
        return {
          label: this.intl.t('inProgress'),
          iconName: 'hourglass-top',
          iconColor: 'info',
        };

      case SCAN_STATUS.NOT_STARTED:
      default:
        return {
          label: this.intl.t('notStarted'),
          iconName: 'do-not-disturb-on',
          iconColor: 'textSecondary',
        };
    }
  }

  get fileId() {
    return this.args.scanData.file.get('id');
  }

  get fileSummary() {
    const file = this.args.scanData.file;

    return [
      {
        label: this.intl.t('version'),
        value: file?.get('version'),
      },
      {
        label: this.intl.t('versionCodeTitleCase'),
        value: file?.get('versionCode'),
      },
      {
        label: this.intl.t('storeReleaseReadiness.scanDetailLastScannedOn'),
        value: this.args.scanData.lastScannedOnLabel,
      },
    ];
  }

  @action
  handleFileSummaryToggle() {
    this.showMoreFileSummary = !this.showMoreFileSummary;
  }

  @action
  handleViewReportDrawerOpen() {
    this.openViewReportDrawer = true;
  }

  @action
  handleViewReportDrawerClose() {
    this.openViewReportDrawer = false;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::FileSummary': typeof StoreReleaseReadinessScanResultsFileSummaryComponent;
  }
}
