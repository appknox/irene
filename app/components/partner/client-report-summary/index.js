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

  get criticalWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.criticalPercent}%`);
  }

  get highWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.highPercent}%`);
  }

  get mediumWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.mediumPercent}%`);
  }

  get lowWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.lowPercent}%`);
  }

  get passedWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.passedPercent}%`);
  }

  get untestedWidthStyle() {
    return htmlSafe(`width: ${this.fileSummary.untestedPercent}%`);
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
