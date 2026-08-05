import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type RouterService from '@ember/routing/router-service';

import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';
import type StoreReleaseReadinessScanModel from 'irene/models/store-release-readiness-scan';

import styles from './index.scss';

export type AssessmentPolicyRowStatus = 'failed' | 'passed' | 'untested';
export type AssessmentPolicyFilter = 'all' | AssessmentPolicyRowStatus;

export interface AssessmentPolicyFilterOption {
  key: string;
  value: AssessmentPolicyFilter;
  statusDotClass: string;
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

const FINDING_PASSED_TO_STATUS: Record<string, AssessmentPolicyRowStatus> = {
  true: 'passed',
  false: 'failed',
};

export interface StoreReleaseReadinessScanResultsSignature {
  Args: { scanId: string };
}

export default class StoreReleaseReadinessScanResultsComponent extends Component<StoreReleaseReadinessScanResultsSignature> {
  @service declare intl: IntlService;
  @service declare router: RouterService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  @tracked scanData: StoreReleaseReadinessScanModel | null = null;
  @tracked assessmentPolicyFilter: AssessmentPolicyFilter = 'all';
  @tracked selectedCategoryLabels: string[] = [];

  SRR_ROUTES = {
    finding: 'authenticated.dashboard.store-release-readiness.finding',
    index: 'authenticated.dashboard.store-release-readiness.index',
  } as const;

  readonly classes = {
    assessmentStatusFilterTrigger: styles['assessment-status-filter-trigger'],
    assessmentStatusFilterDropdown: styles['assessment-status-filter-dropdown'],
    categoryFilterDropdown: styles['assessment-category-filter-dropdown'],
  };

  constructor(
    owner: unknown,
    args: StoreReleaseReadinessScanResultsSignature['Args']
  ) {
    super(owner, args);
    this.loadScan.perform(args.scanId);
  }

  get assessmentPolicyFilterOptionObjects(): AssessmentPolicyFilterOption[] {
    return [
      {
        key: this.intl.t('all'),
        value: 'all',
        statusDotClass: styles['assessment-filter-status-dot-spacer'] ?? '',
      },
      {
        key: this.intl.t('failed'),
        value: 'failed',
        statusDotClass: styles['assessment-filter-status-dot-failed'] ?? '',
      },
      {
        key: this.intl.t('passed'),
        value: 'passed',
        statusDotClass: styles['assessment-filter-status-dot-passed'] ?? '',
      },
      {
        key: this.intl.t('untested'),
        value: 'untested',
        statusDotClass: styles['assessment-filter-status-dot-untested'] ?? '',
      },
    ];
  }

  get selectedAssessmentPolicyFilterObject(): AssessmentPolicyFilterOption {
    const options = this.assessmentPolicyFilterOptionObjects;

    return (
      options.find((option) => option.value === this.assessmentPolicyFilter) ??
      options[0]!
    );
  }

  get assessmentRows(): AssessmentPolicyRow[] {
    const findings = this.scanData?.findings;

    if (!findings?.length) {
      return [];
    }

    return findings
      .map((f) => ({
        id: String(f.id),
        categoryLabel: f.category,
        titleLabel: f.title,
        status: this.findingPassedToStatus(f.passed),
        severity: f.severity,
        isOverridden: f.is_overridden,
      }))
      .sort(this.sortAssessmentRows);
  }

  get categoryFilterOptions(): string[] {
    const labels = this.assessmentRows.map((row) => row.categoryLabel ?? '');

    return [...new Set(labels)].sort((a, b) => a.localeCompare(b));
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

  get showAssessmentFilteredEmpty(): boolean {
    return (
      this.assessmentRows.length > 0 && this.filteredAssessmentRows.length === 0
    );
  }

  get isScanFailed(): boolean {
    return this.scanData?.status === ENUMS.STORE_RELEASE_SCAN_STATUS.FAILED;
  }

  get isScanNotStarted(): boolean {
    return (
      this.scanData?.status === ENUMS.STORE_RELEASE_SCAN_STATUS.NOT_STARTED
    );
  }

  get isScanAssessmentInProgress(): boolean {
    return (
      this.scanData?.status === ENUMS.STORE_RELEASE_SCAN_STATUS.IN_PROGRESS
    );
  }

  get assessmentColumns() {
    return [
      {
        name: this.intl.t('storeReleaseReadiness.assessmentTablePolicy'),
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
  findingPassedToStatus(passed: boolean | null): AssessmentPolicyRowStatus {
    return FINDING_PASSED_TO_STATUS[String(passed)] ?? 'untested';
  }

  @action
  sortAssessmentRows(a: AssessmentPolicyRow, b: AssessmentPolicyRow): number {
    const byStatus =
      ASSESSMENT_STATUS_SORT_ORDER[a.status] -
      ASSESSMENT_STATUS_SORT_ORDER[b.status];

    if (byStatus !== 0) {
      return byStatus;
    }

    const bySeverity =
      (a.severity ?? Number.MAX_SAFE_INTEGER) -
      (b.severity ?? Number.MAX_SAFE_INTEGER);

    return bySeverity !== 0 ? bySeverity : Number(a.id) - Number(b.id);
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
    const query = term.trim().toLowerCase();

    if (!query) {
      return this.categoryFilterOptions;
    }

    return this.categoryFilterOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }

  @action
  isCategoryOptionSelected(label: string): boolean {
    return this.selectedCategoryLabels.includes(label);
  }

  @action
  handleAssessmentRowClick({
    rowValue,
    event,
  }: {
    rowValue: AssessmentPolicyRow;
    event: MouseEvent;
  }) {
    if (!this.scanData) {
      return;
    }

    const scanId = String(this.scanData.id);

    const url = this.router.urlFor(
      this.SRR_ROUTES.finding,
      scanId,
      rowValue.id
    );

    if (event.ctrlKey || event.metaKey) {
      this.window.open(url, '_blank');
    } else {
      this.router.transitionTo(this.SRR_ROUTES.finding, scanId, rowValue.id);
    }
  }

  loadScan = task({ drop: true }, async (scanId: string) => {
    try {
      this.scanData = (await this.store.findRecord(
        'store-release-readiness-scan',
        scanId,
        { reload: true }
      )) as StoreReleaseReadinessScanModel;
    } catch (error) {
      this.notify.error(parseError(error, this.intl.t('pleaseTryAgain')));

      this.router.transitionTo(this.SRR_ROUTES.index);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'StoreReleaseReadiness::ScanResults': typeof StoreReleaseReadinessScanResultsComponent;
  }
}
