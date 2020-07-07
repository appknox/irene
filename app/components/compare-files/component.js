import { inject as service } from '@ember/service';
import { computed, action } from '@ember/object';
import { filter } from '@ember/object/computed';
import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default class CompareFilesComponent extends Component {
  @service intl;
  @service store;
  @service router;

  file1 = null;
  file2 = null;

  isSummary = true;
  isReverse = false;

  @(task(function * (project_id) {
    const files = yield this.store.query("file", {
      projectId: project_id, limit:1000
    })
    return files;
  }))
  fetchAllFiles

  @action
  fetchdata () {
    const project_id = this.get('file1.project.id');
    this.fetchAllFiles.perform(project_id)
  }

  @computed('fetchAllFiles.last.value', function() {
    if (this.fetchAllFiles.last) {
      return this.fetchAllFiles.last.value
    }
    return [];
  })
  allFiles;

  @filter('allFiles', ['file1.id'], function(file) {
    return file.id !== this.file1.id;
  })
  allBaseFiles;

  @filter('allFiles', ['file2.id'], function(file) {
    return file.id !== this.file2.id;
  })
  allCompareFiles;

  @computed('file1.id', 'file2.id', 'tCompareWarningSameFiles', 'tCompareWarningOldFile', function() {
    const file1Id = parseInt(this.get("file1.id"));
    const file2Id = parseInt(this.get("file2.id"));
    if(file1Id === file2Id) {
      return this.intl.t("compareWarningSameFiles");
    }
    else if(file1Id < file2Id) {
      return this.intl.t("compareWarningOldFile");
    }
    return "";
  })
  compareText;


  @computed("file1.analyses.@each.risk", "file2.analyses.@each.risk", function() {
    const comparisons = [];
    const file1Analyses = this.get("file1.analyses");
    const file2Analyses = this.get("file2.analyses");
    if (!file1Analyses || !file2Analyses) {
      return;
    }
    file1Analyses.forEach(function(analysis) {
      const vulnerability = analysis.get("vulnerability");
      const vulnerability_id  = parseInt(vulnerability.get("id"));
      if (!comparisons[vulnerability_id]) { comparisons[vulnerability_id] = {}; }
      comparisons[vulnerability_id]["analysis1"] = analysis;
      return comparisons[vulnerability_id]["vulnerability"] = vulnerability;
    });
    file2Analyses.forEach(function(analysis) {
      const vulnerability = analysis.get("vulnerability");
      const vulnerability_id  = parseInt(vulnerability.get("id"));
      if (!comparisons[vulnerability_id]) { comparisons[vulnerability_id] = {}; }
      comparisons[vulnerability_id]["analysis2"] = analysis;
      return comparisons[vulnerability_id]["vulnerability"] = vulnerability;
    });
    comparisons.removeObject(undefined);
    return comparisons;
  })
  comparisons

  goToComparions(baseFileId, compareFileId){
    const comparePath = `${baseFileId}...${compareFileId}`;
    this.router.transitionTo('authenticated.compare', comparePath);
  }

  @action
  selectBaseFile(event) {
    const baseFileId = event.target.value;
    const compareFileId = this.get('file2.id');
    this.goToComparions(baseFileId, compareFileId);
  }

  @action
  selectCompareFile() {
    const baseFileId = this.get('file1.id');
    const compareFileId = event.target.value;
    this.goToComparions(baseFileId, compareFileId);
  }

  @action
  displaySummary() {
    this.set("isSummary", true);
  }

  @action
  displayDetails() {
    this.set("isSummary", false);
  }
}
