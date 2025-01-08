import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import AttachmentModel from 'irene/models/attachment';
import { task } from 'ember-concurrency';
import type IreneAjaxService from 'irene/services/ajax';
import type { AjaxError } from 'irene/services/ajax';

export interface AttachmentDetailSignature {
  Args: {
    attachment: AttachmentModel;
  };
}

interface DownloadResponse {
  data: {
    url: string;
  };
}

export default class AttachmentDetailComponent extends Component<AttachmentDetailSignature> {
  @service declare ajax: IreneAjaxService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  downloadAttachment = task({ drop: true }, async () => {
    const url = ENV.host + this.args.attachment.downloadUrl;

    try {
      const result = await this.ajax.request<DownloadResponse>(url);

      this.window.open(result.data.url);
    } catch (error) {
      if (!this.isDestroyed) {
        this.notify.error((error as AjaxError).payload.message);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AttachmentDetail: typeof AttachmentDetailComponent;
  }
}
