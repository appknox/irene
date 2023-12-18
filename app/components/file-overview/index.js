import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class FileOverviewComponent extends Component {
  @service store;

  chartOptions = {
    legend: { display: false },
    animation: { animateRotate: false },
    responsive: false,
  };

  get file() {
    return this.args.file || null;
  }

  get isManualScanDisabled() {
    return !this.file.get('project')?.get('isManualScanAvailable');
  }

  get fileOld() {
    return this.args.fileOld || null;
  }

  get profileId() {
    return this.args.profileId;
  }

  get unknownAnalysisStatus() {
    return this.store.queryRecord('unknown-analysis-status', {
      id: this.profileId,
    });
  }

  @action
  handleLinkClick(event) {
    event.stopPropagation();
  }
}
