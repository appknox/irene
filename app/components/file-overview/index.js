import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class FileOverviewComponent extends Component {
  @service store;

  chartOptions = {
    legend: { display: false },
    animation: { animateRotate: false },
    responsive: false,
  };

  constructor() {
    super(...arguments);
  }

  get file() {
    return this.args.file || null;
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
