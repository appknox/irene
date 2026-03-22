import { service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import type Store from 'ember-data/store';
import type IntlService from 'ember-intl/services/intl';

import type FileModel from 'irene/models/file';
import type FileAdapter from 'irene/adapters/file';
import parseError from 'irene/utils/parse-error';

export interface FileCopilotValidationBtnSignature {
  Args: {
    file: FileModel;
  };
}

export default class FileCopilotValidationBtn extends Component<FileCopilotValidationBtnSignature> {
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;
  @service declare intl: IntlService;

  triggerValidation = task(async () => {
    try {
      const adapter = this.store.adapterFor('file') as FileAdapter;

      await adapter.triggerCopilotValidation(String(this.args.file.id));

      this.notify.success('Copilot validation triggered successfully');
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'File::CopilotValidationBtn': typeof FileCopilotValidationBtn;
  }
}
