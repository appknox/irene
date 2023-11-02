import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ClipboardJS from 'clipboard/src/clipboard';

export default class PartnerClientReportDownloadReportPasswordComponent extends Component {
  @service intl;
  @service store;
  @service partner;
  @service('notifications') notify;

  @tracked unlockKey = null;
  @tracked anchorRef = null;
  @tracked apiError = false;

  @task(function* () {
    try {
      this.unlockKey = yield this.store.queryRecord(
        'partner/partnerclient-report-unlockkey',
        {
          clientId: this.args.clientId,
          reportId: this.args.reportId,
        }
      );
    } catch (err) {
      this.unlockKey = null;
      this.apiError = true;
    }
  })
  getUnlockKey;

  @action togglePassTrayVisibility(event) {
    if (this.anchorRef) {
      this.closeReportPassTray();

      return;
    }

    if (!this.unlockKey) {
      this.getUnlockKey.perform();
    }

    this.anchorRef = event.currentTarget;
  }

  @action closeReportPassTray() {
    this.anchorRef = null;
  }

  @action
  onCopyPassword() {
    let clipboard = new ClipboardJS(
      `.copy-unlock-key-button-${this.args.reportId}`
    );

    clipboard.on('success', async (err) => {
      this.notify.info(
        `Report password copied for file ID ${this.args.fileId}`
      );
      err.clearSelection();
      clipboard.destroy();
    });

    clipboard.on('error', () => {
      this.notify.error(this.intl.t('tPleaseTryAgain'));
      clipboard.destroy();
    });
  }
}
