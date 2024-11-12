import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { service } from '@ember/service';

import ENUMS from 'irene/enums';
import styles from 'irene/components/security/analysis-list/index.scss';

import type SecurityFileModel from 'irene/models/security/file';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import parseError from 'irene/utils/parse-error';

export interface SecurityAnalysisListComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityAnalysisListComponent extends Component<SecurityAnalysisListComponentSignature> {
  @service declare notify: NotificationService;

  @tracked vulnSearchTerm = '';
  @tracked vulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.UNKNOWN;

  @tracked analyses: SecurityAnalysisModel[] | null = null;

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

  get sortedAnalyses() {
    return this.analyses?.sort((a, b) => b.risk - a.risk) || [];
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

  get isFetchingAnalyses() {
    return this.refreshFileAnalyses.isRunning;
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

  refreshFileAnalyses = task(async () => {
    try {
      const file = await this.file.reload();
      const analyses = await file.get('analyses');

      this.analyses = analyses.slice();
    } catch (e) {
      this.notify.error(parseError(e));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList': typeof SecurityAnalysisListComponent;
  }
}
