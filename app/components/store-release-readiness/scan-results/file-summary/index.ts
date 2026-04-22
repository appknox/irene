import Component from '@glimmer/component';
import { capitalize } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreReleaseReadinessCardData } from '../../release-card';

import './index.scss';

const PLACEHOLDER_APP_LOGO_URL =
  'https://appknox-production-public.s3.amazonaws.com/fcc632cc-9a98-4980-ad34-89f4a597b1bf.png';

export interface StoreReleaseReadinessScanResultsFileSummarySignature {
  Element: HTMLDivElement;
  Args: {
    item: StoreReleaseReadinessCardData;
  };
}

export default class StoreReleaseReadinessScanResultsFileSummaryComponent extends Component<StoreReleaseReadinessScanResultsFileSummarySignature> {
  @service declare intl: IntlService;

  @tracked showMoreFileSummary = false;

  readonly placeholderAppLogoSrc = PLACEHOLDER_APP_LOGO_URL;

  get loading() {
    return this.args.item.summaryLoading;
  }

  get headerStatusLabel() {
    switch (this.args.item.analysisStatus) {
      case 'completed':
        return this.intl.t('completed');
      case 'partial':
        return this.intl.t('storeReleaseReadinessModule.partialStatus');
      case 'in_progress':
        return this.intl.t('inProgress');
      case 'not_started':
        return this.intl.t('notStarted');
      default:
        return this.intl.t('completed');
    }
  }

  get isHeaderInProgress() {
    return this.args.item.analysisStatus === 'in_progress';
  }

  get headerStatusIconName() {
    switch (this.args.item.analysisStatus) {
      case 'completed':
        return 'check-circle';
      case 'partial':
        return 'hourglass-top';
      case 'not_started':
        return 'do-not-disturb-on';
      default:
        return 'check-circle';
    }
  }

  get headerStatusIconColor():
    | 'inherit'
    | 'textPrimary'
    | 'textSecondary'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'info'
    | 'warn' {
    switch (this.args.item.analysisStatus) {
      case 'completed':
        return 'success';
      case 'partial':
        return 'warn';
      case 'not_started':
        return 'textSecondary';
      default:
        return 'success';
    }
  }

  get fileSummary() {
    return [
      {
        label: this.intl.t('version'),
        value: this.args.item.version,
      },
      {
        label: capitalize(this.intl.t('versionCode')),
        value: this.args.item.versionCode,
      },
      {
        label: this.intl.t(
          'storeReleaseReadinessModule.scanDetailLastScannedOn'
        ),
        value: this.args.item.lastScannedOn,
      },
    ];
  }

  @action
  handleFileSummaryToggle() {
    this.showMoreFileSummary = !this.showMoreFileSummary;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::FileSummary': typeof StoreReleaseReadinessScanResultsFileSummaryComponent;
  }
}
