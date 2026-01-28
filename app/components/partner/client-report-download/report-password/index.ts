import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import ClipboardJS from 'clipboard/src/clipboard';

import type IntlService from 'ember-intl/services/intl';
import type PartnerService from 'irene/services/partner';
import type Store from 'ember-data/store';
import type PartnerPartnerclientReportUnlockkeyModel from 'irene/models/partner/partnerclient-report-unlockkey';

interface PartnerClientReportDownloadReportPasswordComponentSignature {
  Element: HTMLElement;
  Args: {
    clientId: string;
    fileId: string;
    reportId: string;
  };
}

export default class PartnerClientReportDownloadReportPasswordComponent extends Component<PartnerClientReportDownloadReportPasswordComponentSignature> {
  @service declare intl: IntlService;
  @service declare partner: PartnerService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked unlockKey: PartnerPartnerclientReportUnlockkeyModel | null = null;
  @tracked anchorRef: HTMLElement | null = null;
  @tracked apiError = false;

  getUnlockKey = task(async () => {
    try {
      this.unlockKey = await this.store.queryRecord(
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
  });

  @action togglePassTrayVisibility(event: Event) {
    if (this.anchorRef) {
      this.closeReportPassTray();

      return;
    }

    if (!this.unlockKey) {
      this.getUnlockKey.perform();
    }

    this.anchorRef = event.currentTarget as HTMLElement;
  }

  @action closeReportPassTray() {
    this.anchorRef = null;
  }

  @action
  onCopyPassword() {
    const clipboard = new ClipboardJS(
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

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Partner::ClientReportDownload::ReportPassword': typeof PartnerClientReportDownloadReportPasswordComponent;
  }
}
