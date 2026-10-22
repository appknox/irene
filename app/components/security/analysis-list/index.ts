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

    const loads = await Promise.allSettled(
      analysisIds.map(async (id) => {
        const analysis = await this.store.findRecord('security/analysis', id);

        this.analyses = [...this.analyses, analysis];
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
