import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';

import { type UploadFile } from 'ember-file-upload';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';
import type SecurityAnalysisModel from 'irene/models/security/analysis';
import type IreneAjaxService from 'irene/services/ajax';

export interface SecurityAnalysisDetailsAttachmentsComponentSignature {
  Args: {
    analysis: SecurityAnalysisModel | null;
    updateAnalysis(): Promise<unknown>;
  };
}

type UploadAttachmentResponse = {
  file_key: string;
  file_key_signed: string;
  file_uuid: string;
  url: string;
};

export default class SecurityAnalysisDetailsAttachmentsComponent extends Component<SecurityAnalysisDetailsAttachmentsComponentSignature> {
  @service declare store: Store;
  @service('browser/window') declare window: Window;
  @service declare notifications: NotificationService;
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;

  @tracked showRemoveFileConfirmBox = false;
  @tracked fileIDToDelete: string | null = null;

  @tracked uploadingFile: UploadFile | null = null;

  @tracked previewName: string | null = null;
  @tracked previewUrl: string | null = null;

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get analysis() {
    return this.args.analysis;
  }

  get isUploading() {
    return this.uploadFile.isRunning;
  }

  get hasAttachments() {
    return Boolean(this.analysis?.attachments?.length) || this.isUploading;
  }

  @action openPreviewInNewTab() {
    if (this.previewUrl) {
      this.window.open(this.previewUrl, '_blank');
    }
  }

  @action openRemoveFileConfirmBox(fileId: string) {
    this.fileIDToDelete = fileId;
    this.showRemoveFileConfirmBox = true;
  }

  @action closeRemoveFileConfirmBox() {
    this.fileIDToDelete = null;
    this.showRemoveFileConfirmBox = false;
  }

  @action triggerDownloadAttachment(id: string) {
    this.downloadAttachment.perform(id);
  }

  @action confirmFileDeleteAction() {
    this.deleteFile.perform(this.fileIDToDelete as string);
    this.showRemoveFileConfirmBox = false;
  }

  @action triggerFileUpload(file: UploadFile) {
    this.uploadFile.perform(file);
  }

  @action triggerPreviewAttachment(id: string, name: string) {
    this.previewAttachment.perform(id, name);
  }

  @action closePreview() {
    this.previewName = null;
    this.previewUrl = null;
  }

  async fetchAttachmentUrl(id: string) {
    const url = [
      ENV.endpoints['uploadFile'],
      id,
      ENV.endpoints['downloadAttachment'],
    ].join('/');

    const data = (await this.ajax.request(url, {
      namespace: 'api/hudson-api',
    })) as { url: string };

    return data.url;
  }

  downloadAttachment = task(async (id: string) => {
    try {
      this.window.open(await this.fetchAttachmentUrl(id), '_blank');
    } catch (error) {
      this.notifications.error(parseError(error));
    }
  });

  previewAttachment = task(async (id: string, name: string) => {
    try {
      this.previewUrl = await this.fetchAttachmentUrl(id);
      this.previewName = name;
    } catch (error) {
      this.notifications.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  deleteFile = task(async (id: string) => {
    try {
      const attachment = this.store.peekRecord('security/attachment', id);

      attachment?.deleteRecord();
      attachment?.save();

      this.notifications.success('File Deleted Successfully');
    } catch (error) {
      this.notifications.error(parseError(error, this.tPleaseTryAgain));
    }
  });

  uploadFile = task(async (file: UploadFile) => {
    const fileName = file.name;

    this.uploadingFile = file;

    const data = {
      name: fileName,
    };

    try {
      const fileData = await this.ajax.post<UploadAttachmentResponse>(
        ENV.endpoints['uploadFile'] as string,
        {
          namespace: 'api/hudson-api',
          data,
        }
      );

      await file.uploadBinary(fileData.url, {
        method: 'PUT',
      });

      const fileDetailsData = {
        file_uuid: fileData.file_uuid,
        file_key: fileData.file_key,
        file_key_signed: fileData.file_key_signed,
        name: fileName,
        analysis: this.analysis?.id,
        content_type: 'ANALYSIS',
      };

      await this.ajax.post(ENV.endpoints['uploadedAttachment'] as string, {
        namespace: 'api/hudson-api',
        data: fileDetailsData,
      });

      await this.args.updateAnalysis();
      await this.analysis?.reload();

      this.notifications.success('File Uploaded Successfully');
    } catch (error) {
      this.notifications.error(parseError(error, this.tPleaseTryAgain));
    } finally {
      this.uploadingFile = null;
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::AnalysisDetails::Attachments': typeof SecurityAnalysisDetailsAttachmentsComponent;
  }
}
