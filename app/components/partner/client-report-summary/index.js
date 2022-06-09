import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class PartnerClientReportSummaryComponent extends Component {
  @service intl;
  @service store;
  @service partner;

  @tracked fileSummary = null;

  get totalCount() {
    return (
      this.fileSummary.riskCountCritical +
      this.fileSummary.riskCountHigh +
      this.fileSummary.riskCountMedium +
      this.fileSummary.riskCountLow +
      this.fileSummary.riskCountPassed +
      this.fileSummary.riskCountUntested
    );
  }

  get criticalWidthStyle() {
    let p = (this.fileSummary.riskCountCritical / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  get highWidthStyle() {
    let p = (this.fileSummary.riskCountHigh / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  get mediumWidthStyle() {
    let p = (this.fileSummary.riskCountMedium / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  get lowWidthStyle() {
    let p = (this.fileSummary.riskCountLow / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  get passedWidthStyle() {
    let p = (this.fileSummary.riskCountPassed / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  get untestedWidthStyle() {
    const p = (this.fileSummary.riskCountUntested / this.totalCount) * 100;
    return htmlSafe(`width: ${p}%`);
  }

  @task(function* () {
    try {
      this.fileSummary = yield this.store.queryRecord(
        'partner/partnerclient-file-summary',
        {
          clientId: this.args.clientId,
          fileId: this.args.fileId,
        }
      );
    } catch (err) {
      this.fileSummary = null;
      return;
    }
  })
  getFileSummary;
}
