import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AttachmentModel from 'irene/models/attachment';
import ENV from 'irene/config/environment';
import { task } from 'ember-concurrency';
import parseError from 'irene/utils/parse-error';
import NetworkService from 'irene/services/network';

interface AttachmentDetailSignature {
  Args: {
    attachment: AttachmentModel | null;
  };
}

export default class AttachmentDetailComponent extends Component<AttachmentDetailSignature> {
  @service declare network: NetworkService;
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;

  get attachment() {
    return this.args.attachment;
  }

  get isDownloadingAttachment() {
    return this.downloadAttachment.isRunning;
  }

  @action triggerDownloadAttachment() {
    this.downloadAttachment.perform();
  }

  downloadAttachment = task(async () => {
    const url = ENV.host + this.attachment?.downloadUrl;

    try {
      const response = await this.network.request(url);
      const result = (await response.json()) as { data: { url?: string } };

      this.window.open(result.data?.url);
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    AttachmentDetail: typeof AttachmentDetailComponent;
  }
}
