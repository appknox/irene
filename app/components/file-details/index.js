/* eslint-disable ember/no-computed-properties-in-native-classes */
import { action } from '@ember/object';
import { sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ENUMS from 'irene/enums';

export default class FileDetailsComponent extends Component {
  @service ajax;

  @tracked sortImpactAscending = false;
  @tracked isSecurityEnabled = false;
  @tracked unsortedUnhiddenAnalyses = this.analyses;
  @tracked analysesSorting = ['computedRisk:desc'];

  vulnerabilityType = ENUMS.VULNERABILITY_TYPE.UNKNOWN;

  constructor() {
    super(...arguments);
    this.securityEnabled.perform();
  }

  get file() {
    return this.args.file;
  }

  get analyses() {
    return this.file.analyses;
  }

  get isManualScanDisabled() {
    return !this.file.project?.get('isManualScanAvailable');
  }

  get vulnerabilityTypes() {
    const manualType = ENUMS.VULNERABILITY_TYPE.MANUAL;
    const types = ENUMS.VULNERABILITY_TYPE.CHOICES.slice(0, -1);

    if (this.isManualScanDisabled) {
      return types.filter((type) => type.value !== manualType);
    }

    return types;
  }

  @sort('unsortedUnhiddenAnalyses', 'analysesSorting') sortedUnhiddenAnalyses;

  @action filterVulnerabilityType(event) {
    this.unsortedUnhiddenAnalyses = this.analyses;
    this.sortImpactAscending = false;
    this.vulnerabilityType = event.target.value;
    this.sortUnhiddenAnalyses.perform();
  }

  @action sortByImpact() {
    const sortImpactAscending = this.sortImpactAscending;
    if (!sortImpactAscending) {
      this.analysesSorting = ['computedRisk:asc'];
      this.sortImpactAscending = true;
    } else {
      this.analysesSorting = ['computedRisk:desc'];
      this.sortImpactAscending = false;
    }
  }

  @task(function* () {
    yield this.ajax.request('projects', { namespace: 'api/hudson-api' }).then(
      () => {
        if (!this.isDestroyed) {
          this.isSecurityEnabled = true;
        }
      },
      () => {
        if (!this.isDestroyed) {
          this.isSecurityEnabled = false;
        }
      }
    );
  })
  securityEnabled;

  @task(function* () {
    const vulnerabilityType = parseInt(this.vulnerabilityType);
    const analyses = this.analyses.toArray();
    if (vulnerabilityType === ENUMS.VULNERABILITY_TYPE.UNKNOWN) {
      return analyses;
    }
    const filteredAnalysis = [];
    for (let analysis of analyses) {
      if (analysis.hasType(vulnerabilityType)) {
        filteredAnalysis.push(analysis);
      }
    }

    this.unsortedUnhiddenAnalyses = filteredAnalysis;
    yield filteredAnalysis;
  })
  sortUnhiddenAnalyses;
}
