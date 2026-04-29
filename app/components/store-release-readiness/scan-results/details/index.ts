import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import type { StoreReleaseReadinessCardData } from '../../release-card';

import './index.scss';

function padTwoDigits(value: number): string {
  return String(Math.max(0, value)).padStart(2, '0');
}

export interface StoreReleaseReadinessScanResultsDetailsSignature {
  Element: HTMLDivElement;
  Args: {
    item: StoreReleaseReadinessCardData;
  };
}

export default class StoreReleaseReadinessScanResultsDetailsComponent extends Component<StoreReleaseReadinessScanResultsDetailsSignature> {
  @service declare intl: IntlService;

  get rejectionRiskLabel() {
    switch (this.args.item.riskProfile) {
      case 'high':
        return this.intl.t('storeReleaseReadinessModule.rejectionRiskChipHigh');
      case 'medium':
        return this.intl.t(
          'storeReleaseReadinessModule.rejectionRiskChipMedium'
        );
      case 'low':
        return this.intl.t('storeReleaseReadinessModule.rejectionRiskChipLow');
      case 'pending':
        return this.intl.t(
          'storeReleaseReadinessModule.riskAnalysisPendingChip'
        );
      default:
        return this.intl.t('storeReleaseReadinessModule.rejectionRiskChipHigh');
    }
  }

  get rejectionRiskColor() {
    switch (this.args.item.riskProfile) {
      case 'high':
        return '#D72F2F';
      case 'medium':
        return '#92400e';
      case 'low':
        return '#1e40af';
      case 'pending':
        return '#171717';
      default:
        return '#D72F2F';
    }
  }

  get failedPadded() {
    return padTwoDigits(this.args.item.summaryFailed);
  }

  get blockerPadded() {
    return padTwoDigits(this.args.item.summaryBlocker);
  }

  get warningPadded() {
    return padTwoDigits(this.args.item.summaryWarning);
  }

  get passedPadded() {
    return padTwoDigits(this.args.item.summaryPassed);
  }

  get untestedPadded() {
    return padTwoDigits(this.args.item.summaryUntested);
  }

  get summaryPassedRowLoading() {
    return Boolean(this.args.item.summaryPassedRowLoading);
  }

  get summaryUntestedRowLoading() {
    return Boolean(this.args.item.summaryUntestedRowLoading);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::Details': typeof StoreReleaseReadinessScanResultsDetailsComponent;
  }
}
