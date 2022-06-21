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

  get popoverPlacement() {
    return this.args.indexPlacement ? this.args.indexPlacement : 'top';
  }

  riskWidthStyle(riskPercent) {
    return htmlSafe(`width: ${riskPercent}%`);
  }

  get criticalWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.criticalPercent);
  }

  get highWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.highPercent);
  }

  get mediumWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.mediumPercent);
  }

  get lowWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.lowPercent);
  }

  get passedWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.passedPercent);
  }

  get untestedWidthStyle() {
    return this.riskWidthStyle(this.fileSummary.untestedPercent);
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
