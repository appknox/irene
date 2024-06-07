import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';

import ENUMS from 'irene/enums';
import styles from 'irene/components/security/analysis-list/index.scss';

import type SecurityFileModel from 'irene/models/security/file';

export interface SecurityAnalysisListComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityAnalysisListComponent extends Component<SecurityAnalysisListComponentSignature> {
  @tracked vulnSearchTerm = '';
  @tracked vulnerabilityType: string | number =
    ENUMS.VULNERABILITY_TYPE.UNKNOWN;

  get file() {
    return this.args.file;
  }

  get sortedAnalyses() {
    return this.file.get('sortedAnalyses');
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
    return (
      !this.vulnSearchTerm.trim() &&
      this.vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN &&
      !this.refreshFileAnalyses.isRunning &&
      this.sortedAnalyses.length < 1
    );
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

  refreshFileAnalyses = task(async () => await this.file.get('analyses'));
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisList': typeof SecurityAnalysisListComponent;
  }
}
