import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import ENV from 'irene/config/environment';
import AttachmentModel from 'irene/models/attachment';
import { task } from 'ember-concurrency';

export interface AttachmentDetailSignature {
  Args: {
    attachment: AttachmentModel;
  };
}

export default class AttachmentDetailComponent extends Component<AttachmentDetailSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  downloadAttachment = task({ drop: true }, async () => {
    const url = ENV.host + this.args.attachment.downloadUrl;

    try {
      const result = await this.ajax.request(url);

      this.window.open(result.data.url);
    } catch (error) {
      if (!this.isDestroyed) {
        this.notify.error((error as AdapterError).payload.message);
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AttachmentDetail: typeof AttachmentDetailComponent;
  }
}
