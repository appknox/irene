import Component from '@glimmer/component';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

export type StoreRiskProfile = 'high' | 'medium' | 'low' | 'pending';

export type StoreAnalysisHeaderStatus =
  | 'completed'
  | 'partial'
  | 'in_progress'
  | 'not_started'
  | 'failed';

export interface StoreReleaseReadinessCardData {
  id: string;
  fileId: string;
  title: string;
  appName: string;
  packageName: string;
  iconUrl: string;
  releaseDate: string;
  version: string;
  versionCode: string;
  lastScannedOn: string;
  platform: 'android' | 'apple';
  riskProfile: StoreRiskProfile;
  analysisStatus: StoreAnalysisHeaderStatus;
  summaryFailed: number;
  summaryBlocker: number;
  summaryWarning: number;
  summaryPassed: number;
  summaryUntested: number;
  summaryLoading: boolean;
  summaryPassedRowLoading: boolean;
  summaryUntestedRowLoading: boolean;
}

export interface StoreReleaseReadinessReleaseCardSignature {
  Args: {
    item: StoreReleaseReadinessScanModel;
  };
}

type RiskChipIconPresentation =
  | { kind: 'svg'; componentName: string }
  | { kind: 'pending' }
  | { kind: 'none' };

export default class StoreReleaseReadinessReleaseCardComponent extends Component<StoreReleaseReadinessReleaseCardSignature> {
  @service declare intl: IntlService;

  get appPlatformIcon(): 'android' | 'apple' {
    return this.args.item.platform === ENUMS.PLATFORM.IOS ? 'apple' : 'android';
  }

  get formattedReleaseDate(): string {
    const d = this.args.item.createdAt;

    return d ? dayjs(d).format('MMM DD, YYYY') : '-';
  }

  get summaryProgressLoading(): boolean {
    return (
      this.args.item.status === ENUMS.STORE_RELEASE_SCAN_STATUS.IN_PROGRESS
    );
  }

  get summaryRowSpinners(): boolean {
    const s = ENUMS.STORE_RELEASE_SCAN_STATUS;
    const st = this.args.item.status;

    return st === s.IN_PROGRESS || st === s.PARTIAL;
  }

  get riskChipClass() {
    switch (this.args.item.verdict) {
      case ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK:
        return 'risk-chip-high';
      case ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK:
        return 'risk-chip-medium';
      case ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK:
        return 'risk-chip-low';
      default:
        return 'risk-chip-pending';
    }
  }

  private get riskChipIconPresentation(): RiskChipIconPresentation {
    const v = this.args.item.verdict;
    const verdict = ENUMS.STORE_RELEASE_VERDICT;

    if (v === 4) {
      return { kind: 'pending' };
    }
    if (v === verdict.HIGH_REJECTION_RISK) {
      return { kind: 'svg', componentName: 'ak-svg/high-risk-tower' };
    }
    if (v === verdict.MODERATE_REJECTION_RISK) {
      return { kind: 'svg', componentName: 'ak-svg/medium-risk-tower' };
    }
    if (v === verdict.LOW_REJECTION_RISK) {
      return { kind: 'svg', componentName: 'ak-svg/low-risk-tower' };
    }

    return { kind: 'none' };
  }

  get riskChipSvgComponentName(): string | null {
    const p = this.riskChipIconPresentation;

    return p.kind === 'svg' ? p.componentName : null;
  }

  get riskChipShowsPendingSearchIcon(): boolean {
    return this.riskChipIconPresentation.kind === 'pending';
  }

  get headerStatusLabel() {
    switch (this.args.item.status) {
      case 4:
        return this.intl.t('failed');
      case 3:
        return this.intl.t('completed');
      case 2:
        return this.intl.t('storeReleaseReadinessModule.partialStatus');
      case 1:
        return this.intl.t('inProgress');
      case 0:
        return this.intl.t('notStarted');
      default:
        return this.intl.t('completed');
    }
  }

  get isHeaderInProgress() {
    return this.args.item.status === 1;
  }

  get headerStatusIconName() {
    switch (this.args.item.status) {
      case ENUMS.STORE_RELEASE_SCAN_STATUS.FAILED:
        return 'cancel';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.COMPLETED:
        return 'check-circle';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.PARTIAL:
        return 'hourglass-top';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.NOT_STARTED:
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
    switch (this.args.item.status) {
      case ENUMS.STORE_RELEASE_SCAN_STATUS.FAILED:
        return 'error';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.COMPLETED:
        return 'success';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.PARTIAL:
        return 'warn';
      case ENUMS.STORE_RELEASE_SCAN_STATUS.NOT_STARTED:
        return 'textSecondary';
      default:
        return 'success';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ReleaseCard': typeof StoreReleaseReadinessReleaseCardComponent;
  }
}
