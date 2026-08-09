import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import ENUMS from 'irene/enums';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

import styles from './index.scss';

export interface StoreReleaseReadinessScanResultsDetailsSignature {
  Element: HTMLDivElement;
  Args: {
    scanData: StoreReleaseReadinessScanModel;
  };
}

type RiskTowerSvgComponent =
  | 'ak-svg/high-risk-tower-big'
  | 'ak-svg/medium-risk-tower-big'
  | 'ak-svg/low-risk-tower-big'
  | 'ak-svg/not-started-tower';

type ScanResultsDetailsRejectionRisk = {
  label: string;
  variantClass: string;
  towerSvgComponent: RiskTowerSvgComponent;
};

type SummaryCountsMetricKind =
  | 'failed'
  | 'blocker'
  | 'warning'
  | 'untested'
  | 'passed';

type SummaryCountsMetricRow = {
  summaryKind: SummaryCountsMetricKind;
  leadingDotClass?: string;
  leadingIcon?: {
    iconName: 'block' | 'warning';
    iconColor: 'error';
  };
  labelKey: string;
  labelStrong: boolean;
  labelMuted: boolean;
  value: string | number;
  valueStrong: boolean;
  valueMuted: boolean;
  valueLoading: boolean;
};

function statusDotStackClass(
  variant: 'failed' | 'untested' | 'passed'
): string {
  const base = styles['status-dot'];
  const variantClass = styles[`status-dot-${variant}`];

  return [base, variantClass].filter(Boolean).join(' ');
}

export default class StoreReleaseReadinessScanResultsDetailsComponent extends Component<StoreReleaseReadinessScanResultsDetailsSignature> {
  @service declare intl: IntlService;

  get rejectionRisk(): ScanResultsDetailsRejectionRisk {
    switch (this.args.scanData.verdict) {
      case ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK:
        return {
          label: this.intl.t('storeReleaseReadiness.rejectionRiskChipHigh'),
          variantClass: styles['scan-results-details-risk-high'] ?? '',
          towerSvgComponent: 'ak-svg/high-risk-tower-big',
        };

      case ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK:
        return {
          label: this.intl.t('storeReleaseReadiness.rejectionRiskChipMedium'),
          variantClass: styles['scan-results-details-risk-medium'] ?? '',
          towerSvgComponent: 'ak-svg/medium-risk-tower-big',
        };

      case ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK:
        return {
          label: this.intl.t('storeReleaseReadiness.rejectionRiskChipLow'),
          variantClass: styles['scan-results-details-risk-low'] ?? '',
          towerSvgComponent: 'ak-svg/low-risk-tower-big',
        };

      default:
        return {
          label: this.intl.t('storeReleaseReadiness.riskAnalysisPendingChip'),
          variantClass: styles['scan-results-details-risk-pending'] ?? '',
          towerSvgComponent: 'ak-svg/not-started-tower',
        };
    }
  }

  get summaryCountsSections(): { rows: SummaryCountsMetricRow[] }[] {
    const scan = this.args.scanData;

    const failed: SummaryCountsMetricRow = {
      summaryKind: 'failed',
      leadingDotClass: statusDotStackClass('failed'),
      labelKey: 'failed',
      labelStrong: true,
      labelMuted: false,
      value: scan.summaryFailed,
      valueStrong: true,
      valueMuted: false,
      valueLoading: false,
    };

    const blocker: SummaryCountsMetricRow = {
      summaryKind: 'blocker',
      leadingIcon: { iconName: 'block', iconColor: 'error' },
      labelKey: 'storeReleaseReadiness.summaryBlocker',
      labelStrong: false,
      labelMuted: true,
      value: scan.summaryBlocker,
      valueStrong: false,
      valueMuted: true,
      valueLoading: false,
    };

    const warning: SummaryCountsMetricRow = {
      summaryKind: 'warning',
      leadingIcon: { iconName: 'warning', iconColor: 'error' },
      labelKey: 'storeReleaseReadiness.summaryWarning',
      labelStrong: false,
      labelMuted: true,
      value: scan.summaryWarning,
      valueStrong: false,
      valueMuted: true,
      valueLoading: false,
    };

    const untested: SummaryCountsMetricRow = {
      summaryKind: 'untested',
      leadingDotClass: statusDotStackClass('untested'),
      labelKey: 'untested',
      labelStrong: true,
      labelMuted: false,
      value: scan.summaryUntested,
      valueStrong: true,
      valueMuted: false,
      valueLoading: Boolean(scan.summaryUntestedRowLoading),
    };

    const passed: SummaryCountsMetricRow = {
      summaryKind: 'passed',
      leadingDotClass: statusDotStackClass('passed'),
      labelKey: 'passed',
      labelStrong: true,
      labelMuted: false,
      value: scan.summaryPassed,
      valueStrong: true,
      valueMuted: false,
      valueLoading: Boolean(scan.summaryPassedRowLoading),
    };

    return [
      { rows: [failed, blocker, warning] },
      { rows: [untested] },
      { rows: [passed] },
    ];
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults::Details': typeof StoreReleaseReadinessScanResultsDetailsComponent;
  }
}
