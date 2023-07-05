import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';
import styles from './index.scss';

import FileModel from 'irene/models/file';
import ENV from 'irene/config/environment';
import TagModel from 'irene/models/tag';

export interface FileDetailsSummaryFileTagsSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileDetailsSummaryFileTagsComponent extends Component<FileDetailsSummaryFileTagsSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;

  @tracked showAddTagForm = false;
  @tracked tagName = '';

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get classes() {
    return {
      addTagTextFieldRoot: styles['add-tag-text-field-root'],
    };
  }

  @action
  handleShowAddTagForm() {
    this.showAddTagForm = true;
  }

  @action
  handleHideAddTagForm() {
    this.showAddTagForm = false;
  }

  handleAddTag = task(async () => {
    try {
      if (this.tagName.trim()) {
        const url = [
          ENV.endpoints['files'],
          this.args.file.id,
          ENV.endpoints['tags'],
        ].join('/');

        await this.ajax.post(url, {
          namespace: ENV.namespace_v2,
          data: {
            name: this.tagName,
          },
        });

        await this.args.file.reload();

        this.notify.success(this.intl.t('fileTag.addedSuccessMsg'));

        this.handleHideAddTagForm();

        this.tagName = '';
      } else {
        throw Error(this.intl.t('fileTag.blankErrorMsg'));
      }
    } catch (error) {
      const err = error as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (err.payload && Object.keys(err.payload).length) {
        Object.keys(err.payload).forEach((p) => {
          errMsg = err.payload[p];

          if (typeof errMsg !== 'string') {
            errMsg = err.payload[p][0];
          }

          this.notify.error(errMsg);
        });

        return;
      } else if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });

  handleDeleteTag = task(async (tag: TagModel) => {
    try {
      const url = [
        ENV.endpoints['files'],
        this.args.file.id,
        ENV.endpoints['tags'],
        tag.id,
      ].join('/');

      await this.ajax.delete(url, {
        namespace: ENV.namespace_v2,
      });

      await this.args.file.reload();

      this.notify.success(this.intl.t('fileTag.deletedSuccessMsg'));
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::Summary::FileTags': typeof FileDetailsSummaryFileTagsComponent;
    'file-details/summary/file-tags': typeof FileDetailsSummaryFileTagsComponent;
  }
}
