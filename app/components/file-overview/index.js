import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class FileOverviewComponent extends Component {
  @service store;
  @service organization;

  chartOptions = {
    legend: { display: false },
    animation: { animateRotate: false },
    responsive: false,
  };

  get file() {
    return this.args.file || null;
  }

  get isManualScanDisabled() {
    return !this.organization.selected.features.manualscan;
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
}
