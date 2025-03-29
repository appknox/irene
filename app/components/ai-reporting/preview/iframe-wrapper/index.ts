import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import type IntlService from 'ember-intl/services/intl';

import ENV from 'irene/config/environment';

interface AiReportingPreviewIframeWrapperSignature {
  Args: {
    name: string;
    downloadUrl: string;
    onDownloadReset: () => void;
  };
  Blocks: {
    default: [(form: HTMLFormElement) => void];
  };
}

export default class AiReportingPreviewIframeWrapperComponent extends Component<AiReportingPreviewIframeWrapperSignature> {
  @service('notifications') declare notify: NotificationService;
  @service('browser/document') declare document: Document;
  @service declare intl: IntlService;

  generatingInterval?: number;

  constructor(
    owner: unknown,
    args: AiReportingPreviewIframeWrapperSignature['Args']
  ) {
    super(owner, args);
    window.addEventListener('message', this.handleMessage, false);
  }

  willDestroy() {
    super.willDestroy();

    window.removeEventListener('message', this.handleMessage, false);

    if (this.generatingInterval) {
      clearInterval(this.generatingInterval);
    }
  }

  @action
  handleMessage(event: MessageEvent) {
    if (event.data?.type !== 'DownloadFailureError') {
      return;
    }

    const isTrusted =
      event.origin === ENV.host || event.origin === window.origin;

    if (!isTrusted) {
      return;
    }

    this.handleDownloadFailure(event.data.message);
  }

  @action
  handleDownloadInit(form: HTMLFormElement) {
    form.action = this.args.downloadUrl as string;
    form.submit();

    let checkCounter = 0;

    this.generatingInterval = setInterval(() => {
      // timeout of 45 seconds need to be same as backend
      if (checkCounter === 45) {
        this.handleDownloadFailure(
          this.intl.t('reportModule.generationTimedOut')
        );
      }

      checkCounter++;

      if (this.document.cookie.includes('report_download_started=1')) {
        this.notify.info(
          this.intl.t('reportModule.reportGeneratedCheckDownload')
        );

        this.args.onDownloadReset();
      }
    }, 1000);
  }

  @action
  handleDownloadFailure(message: string) {
    this.notify.error(message);

    this.args.onDownloadReset();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'AiReporting::Preview::IframeWrapper': typeof AiReportingPreviewIframeWrapperComponent;
  }
}
