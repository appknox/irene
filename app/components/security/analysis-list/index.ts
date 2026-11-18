import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';

import ENUMS from 'irene/enums';
import styles from 'irene/components/security/analysis-list/index.scss';

import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';
import type SecurityFileModel from 'irene/models/security/file';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import parseError from 'irene/utils/parse-error';

export interface SecurityAnalysisListComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

const LIST_PAGE_SIZE = 300;

export default class SecurityAnalysisListComponent extends Component<SecurityAnalysisListComponentSignature> {
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked vulnSearchTerm = '';
  @tracked vulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.UNKNOWN;

  @tracked analyses: SecurityAnalysisModel[] = [];

  constructor(
    owner: unknown,
    args: SecurityAnalysisListComponentSignature['Args']
  ) {
    super(owner, args);

    this.refreshFileAnalyses.perform();
  }

  get file() {
    return this.args.file;
  }

  // Sorts a copy so the tracked array keeps its arrival order; rows are
  // ordered by risk from the first one that loads.
  get sortedAnalyses() {
    return [...this.analyses].sort((a, b) => b.risk - a.risk);
  }

  get isManualScanEnabled() {
    return this.file?.project?.get('isManualScanAvailable');
  }

  get vulnerabilityTypes() {
    const types = ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1);

    const options = [
      ENUMS.VULNERABILITY_TYPE.UNKNOWN,
      ...types.map(({ value }) => value),
    ] as number[];

    return options;
  }

  get finalSortedAnalyses() {
    const vulnerabilityType = parseInt(String(this.vulnerabilityType));
    let sortedAnalyses = this.sortedAnalyses;

    if (this.vulnSearchTerm) {
      sortedAnalyses = sortedAnalyses.filter((a) =>
        a.vulnerability
          ?.get('name')
          ?.toLowerCase()
          .trim()
          .includes(this.vulnSearchTerm.trim().toLowerCase())
      );
    }

    if (vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN) {
      return sortedAnalyses;
    }

    const filteredAnalysis = sortedAnalyses?.filter((a) =>
      a.hasType(vulnerabilityType)
    );

    return filteredAnalysis;
  }

  // Only covers the wait for the first analysis; after that the table shows
  // what has arrived.
  get isFetchingAnalyses() {
    return this.refreshFileAnalyses.isRunning && this.analyses.length === 0;
  }

  get vulnSearchResultIsEmpty() {
    return !!this.vulnSearchTerm.trim() && this.finalSortedAnalyses.length < 1;
  }

  get dropDownClass() {
    return styles['filter-input-dropdown'];
  }

  get triggerClass() {
    return styles['filter-input'];
  }

  get clearFilterIconClass() {
    return styles['clear-filter-icon'];
  }

  get showClearFilter() {
    return this.vulnerabilityType && Number(this.vulnerabilityType) !== -1;
  }

  @action clearVulnSearchTerm() {
    this.vulnSearchTerm = '';
  }

  @action
  filterVulnerabilityType(vulnType: number) {
    this.vulnerabilityType = vulnType;
  }

  @action
  clearFilters() {
    this.vulnerabilityType = ENUMS.VULNERABILITY_TYPE.UNKNOWN;
  }

  @action
  reloadAnalysisList() {
    this.refreshFileAnalyses.perform();
  }

  /**
   * Loads the file's analyses individually so one slow or failed request
   * neither holds back nor discards the rest.
   */
  refreshFileAnalyses = task(async () => {
    this.analyses = [];

    let file;

    try {
      file = await this.file.reload();
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));

      return;
    }

    const analysisIds = file.hasMany('analyses').ids();
    const wanted = new Set(analysisIds);
    const loaded = new Map<string, SecurityAnalysisModel>();

    // One paged list call (?file=) instead of one request per analysis.
    // If it fails, or an older backend ignores ?file=, the analyses it did
    // not return are loaded one by one below, as before.
    const addLoaded = (records: SecurityAnalysisModel[]) => {
      records.forEach((record) => {
        if (wanted.has(String(record.id))) {
          loaded.set(String(record.id), record);
        }
      });

      this.analyses = [...loaded.values()];
    };

    try {
      const query = (offset: number) =>
        this.store.query('security/analysis', {
          file: file.id,
          limit: LIST_PAGE_SIZE,
          offset,
        });

      const firstPage = await query(0);

      addLoaded(firstPage.slice());

      const total = Number(
        (firstPage as unknown as { meta?: { count?: number } }).meta?.count ?? 0
      );

      // Page on only when the count matches this file's analyses; a larger
      // count means the backend did not filter by file.
      if (total > LIST_PAGE_SIZE && total <= analysisIds.length) {
        const offsets = [];

        for (let o = LIST_PAGE_SIZE; o < total; o += LIST_PAGE_SIZE) {
          offsets.push(o);
        }

        const pages = await Promise.all(offsets.map((o) => query(o)));

        pages.forEach((page) => addLoaded(page.slice()));
      }
    } catch {
      // handled by the per-analysis fallback below
    }

    const loads = await Promise.allSettled(
      analysisIds
        .filter((id) => !loaded.has(String(id)))
        .map(async (id) => {
          const analysis = await this.store.findRecord('security/analysis', id);

          addLoaded([analysis]);
        })
    );

    const failedCount = loads.filter(
      (load) => load.status === 'rejected'
    ).length;

    if (failedCount > 0) {
      this.notify.error(
        this.intl.t('securityAnalysisList.someAnalysesFailedToLoad', {
          count: failedCount,
        })
      );
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList': typeof SecurityAnalysisListComponent;
  }
}
