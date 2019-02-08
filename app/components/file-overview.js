import Component from '@ember/component';
import { computed } from '@ember/object';

const FileOverviewComponent = Component.extend({
  file: null,
  fileOld: null,
  tagName: 'tr',
  unknownAnalysisStatus: computed(function() {
    return this.get("store").queryRecord('unknown-analysis-status', {id: this.get("profileId")});
  })
});

export default FileOverviewComponent;
