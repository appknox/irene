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
import type FileModel from 'irene/models/file';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';
import type {
  StoreAnalysisHeaderStatus,
  StoreReleaseReadinessCardData,
  StoreRiskProfile,
} from '../release-card';

import styles from './index.scss';

export type AssessmentPolicyRowStatus = 'failed' | 'passed' | 'untested';

export type AssessmentPolicyFilter = 'all' | AssessmentPolicyRowStatus;

export interface AssessmentPolicyFilterOption {
  key: string;
  value: AssessmentPolicyFilter;
}

export interface AssessmentPolicyRow {
  id: string;
  categoryLabel?: string;
  titleLabel?: string;
  categoryKey?: string;
  titleKey?: string;
  status: AssessmentPolicyRowStatus;
  severity?: number;
  isOverridden?: boolean;
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
  if (status === s.FAILED) {
    return 'failed';
  }

  return 'not_started';
}

function mapVerdictToRiskProfile(verdict: number): StoreRiskProfile {
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.HIGH_REJECTION_RISK) {
    return 'high';
  }
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.MODERATE_REJECTION_RISK) {
    return 'medium';
  }
  if (verdict === ENUMS.STORE_RELEASE_VERDICT.LOW_REJECTION_RISK) {
    return 'low';
  }

  return 'pending';
}

function formatScanDate(d: Date | null | undefined): string {
  return d ? dayjs(d).format('MMM DD, YYYY') : '-';
}

function displayFromFile(value: string | undefined): string {
  return value != null && String(value).trim() !== '' ? String(value) : '-';
}

function cardDataFromScan(
  scan: StoreReleaseReadinessScanModel,
  file: FileModel | null
): StoreReleaseReadinessCardData {
  const s = ENUMS.STORE_RELEASE_SCAN_STATUS;
  const status = scan.status;
  const displayName = scan.fileName || scan.packageName || '';
  const platform: 'android' | 'apple' =
    scan.platform === ENUMS.PLATFORM.IOS ? 'apple' : 'android';

  const fileFk = scan.belongsTo('file').id();
  const fileId = fileFk != null && String(fileFk) !== '' ? String(fileFk) : '';

  return {
    id: String(scan.id),
    title: displayName,
    appName: displayName,
    packageName: scan.packageName || '',
    releaseDate: formatScanDate(scan.createdAt),
    fileId,
    version: displayFromFile(file?.version),
    versionCode: displayFromFile(file?.versionCode),
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

  @tracked assessmentPolicyFilter: AssessmentPolicyFilter = 'all';

  @tracked selectedCategoryLabels: string[] = [];

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

      let file: FileModel | null = null;

      try {
        file = (await scan.file) ?? null;
      } catch {
        file = null;
      }

      this.scan = scan;
      this.cardData = cardDataFromScan(scan, file);
    } catch {
      this.router.transitionTo(
        'authenticated.dashboard.store-release-readiness.index'
      );
    }
  });

  get classes() {
    return {
      assessmentStatusFilterTrigger: styles['assessment-status-filter-trigger'],
      assessmentStatusFilterDropdown:
        styles['assessment-status-filter-dropdown'],
      categoryFilterDropdown: styles['assessment-category-filter-dropdown'],
    };
  }

  get assessmentPolicyFilterOptionObjects(): AssessmentPolicyFilterOption[] {
    return [
      { key: this.intl.t('all'), value: 'all' },
      { key: this.intl.t('failed'), value: 'failed' },
      { key: this.intl.t('passed'), value: 'passed' },
      { key: this.intl.t('untested'), value: 'untested' },
    ];
  }

  get selectedAssessmentPolicyFilterObject(): AssessmentPolicyFilterOption {
    const opts = this.assessmentPolicyFilterOptionObjects;
    const match = opts.find((o) => o.value === this.assessmentPolicyFilter);

    return match ?? opts[0]!;
  }

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
      isOverridden: f.is_overridden,
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

  get categoryFilterOptions(): string[] {
    const labels = this.assessmentRows
      .map((r) => r.categoryLabel)
      .filter((x): x is string => x != null && String(x).trim() !== '');

    return [...new Set(labels)].sort((a, b) => a.localeCompare(b));
  }

  get showAssessmentFilteredEmpty(): boolean {
    return (
      this.assessmentRows.length > 0 && this.filteredAssessmentRows.length === 0
    );
  }

  get filteredAssessmentRows(): AssessmentPolicyRow[] {
    let rows = this.assessmentRows;

    if (this.assessmentPolicyFilter !== 'all') {
      rows = rows.filter((r) => r.status === this.assessmentPolicyFilter);
    }

    if (this.selectedCategoryLabels.length > 0) {
      const selected = new Set(this.selectedCategoryLabels);

      rows = rows.filter(
        (r) => r.categoryLabel != null && selected.has(r.categoryLabel)
      );
    }

    return rows;
  }

  @action
  onAssessmentPolicyFilterChange(selected: AssessmentPolicyFilterOption) {
    this.assessmentPolicyFilter = selected.value;
  }

  @action
  onCategoryFilterChange(selected: string[]) {
    this.selectedCategoryLabels = selected ?? [];
  }

  @action
  searchCategories(term: string): string[] {
    const opts = this.categoryFilterOptions;
    const q = term.trim().toLowerCase();

    if (!q.length) {
      return opts;
    }

    return opts.filter((o) => o.toLowerCase().includes(q));
  }

  @action
  isCategoryOptionSelected(label: string): boolean {
    return this.selectedCategoryLabels.includes(label);
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
