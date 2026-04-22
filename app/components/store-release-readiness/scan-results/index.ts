import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';
import { task } from 'ember-concurrency';
import dayjs from 'dayjs';

import ENUMS from 'irene/enums';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';
import type {
  StoreAnalysisHeaderStatus,
  StoreReleaseReadinessCardData,
  StoreRiskProfile,
} from '../release-card';

import './index.scss';

export type AssessmentPolicyRowStatus = 'failed' | 'passed' | 'untested';

export interface AssessmentPolicyRow {
  id: string;
  categoryLabel?: string;
  titleLabel?: string;
  categoryKey?: string;
  titleKey?: string;
  status: AssessmentPolicyRowStatus;
  severity?: number;
}

const ASSESSMENT_STATUS_SORT_ORDER: Record<AssessmentPolicyRowStatus, number> =
  {
    failed: 0,
    passed: 1,
    untested: 2,
  };

function findingPassedToStatus(
  passed: boolean | null
): AssessmentPolicyRowStatus {
  if (passed === true) {
    return 'passed';
  }
  if (passed === false) {
    return 'failed';
  }

  return 'untested';
}

function mapStatusToAnalysisStatus(status: number): StoreAnalysisHeaderStatus {
  const s = ENUMS.STORE_RELEASE_SCAN_STATUS;

  if (status === s.COMPLETED) {
    return 'completed';
  }
  if (status === s.PARTIAL) {
    return 'partial';
  }
  if (status === s.IN_PROGRESS) {
    return 'in_progress';
  }

  return 'not_started';
}

function mapVerdictToRiskProfile(verdict: number): StoreRiskProfile {
  if (verdict === 4) {
    return 'pending';
  }
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK) {
    return 'high';
  }
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK) {
    return 'medium';
  }
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK) {
    return 'low';
  }

  return 'high';
}

function formatScanDate(d: Date | null | undefined): string {
  return d ? dayjs(d).format('MMM DD, YYYY') : '-';
}

function cardDataFromScan(
  scan: StoreReleaseReadinessScanModel
): StoreReleaseReadinessCardData {
  const s = ENUMS.STORE_RELEASE_SCAN_STATUS;
  const status = scan.status;
  const displayName = scan.fileName || scan.packageName || '';
  const platform: 'android' | 'apple' =
    scan.platform === ENUMS.PLATFORM.IOS ? 'apple' : 'android';

  return {
    id: String(scan.id),
    title: displayName,
    appName: displayName,
    packageName: scan.packageName || '',
    releaseDate: formatScanDate(scan.createdAt),
    version: '-',
    versionCode: '-',
    lastScannedOn: formatScanDate(scan.completedAt ?? scan.createdAt),
    platform,
    riskProfile: mapVerdictToRiskProfile(scan.verdict),
    analysisStatus: mapStatusToAnalysisStatus(status),
    summaryFailed: scan.failedCount ?? 0,
    summaryBlocker: scan.blockerCount ?? 0,
    summaryWarning: scan.warningCount ?? 0,
    summaryPassed: scan.passedCount ?? 0,
    summaryUntested: scan.untestedCount ?? 0,
    summaryLoading: status === s.IN_PROGRESS,
    summaryPassedRowLoading: status === s.IN_PROGRESS || status === s.PARTIAL,
    summaryUntestedRowLoading: status === s.IN_PROGRESS || status === s.PARTIAL,
  };
}

export interface StoreReleaseReadinessScanResultsSignature {
  Args: {
    releaseId: string;
  };
}

export default class StoreReleaseReadinessScanResultsComponent extends Component<StoreReleaseReadinessScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('browser/window') declare window: Window;

  @tracked cardData: StoreReleaseReadinessCardData | null = null;

  @tracked scan: StoreReleaseReadinessScanModel | null = null;

  constructor(
    owner: unknown,
    args: StoreReleaseReadinessScanResultsSignature['Args']
  ) {
    super(owner, args);

    this.loadScan.perform(args.releaseId);
  }

  loadScan = task({ drop: true }, async (releaseId: string) => {
    try {
      const scan = (await this.store.findRecord(
        'store-release-readiness-scan',
        releaseId,
        { reload: true }
      )) as StoreReleaseReadinessScanModel;

      this.scan = scan;
      this.cardData = cardDataFromScan(scan);
    } catch {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.index'
      );
    }
  });

  get assessmentRows(): AssessmentPolicyRow[] {
    const findings = this.scan?.findings;
    if (!findings?.length) {
      return [];
    }

    const rows = findings.map((f) => ({
      id: String(f.id),
      categoryLabel: f.category,
      titleLabel: f.title,
      status: findingPassedToStatus(f.passed),
      severity: f.severity,
    }));

    return [...rows].sort((a, b) => {
      const byStatus =
        ASSESSMENT_STATUS_SORT_ORDER[a.status] -
        ASSESSMENT_STATUS_SORT_ORDER[b.status];
      if (byStatus !== 0) {
        return byStatus;
      }
      return a.id.localeCompare(b.id);
    });
  }

  get assessmentColumns() {
    return [
      {
        name: this.intl.t('storeReleaseReadinessModule.assessmentTablePolicy'),
        component:
          'store-release-readiness/scan-results/assessment-table/policy-cell',
        width: 280,
        isResizable: false,
        isReorderable: false,
      },
      {
        name: this.intl.t('status'),
        component:
          'store-release-readiness/scan-results/assessment-table/status-cell',
        width: 160,
        textAlign: 'right' as const,
        isResizable: false,
        isReorderable: false,
      },
    ];
  }

  @action
  handleAssessmentRowClick({
    rowValue,
    event,
  }: {
    rowValue: AssessmentPolicyRow;
    event: MouseEvent;
  }) {
    if (!this.cardData) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      const url = this.router.urlFor(
        'authenticated.dashboard.store-release-readiness.finding',
        this.cardData.id,
        rowValue.id
      );

      this.window.open(url, '_blank');
    } else {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.finding',
        this.cardData.id,
        rowValue.id
      );
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults': typeof StoreReleaseReadinessScanResultsComponent;
  }
}
