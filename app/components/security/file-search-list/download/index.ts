import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import IntlService from 'ember-intl/services/intl';

import SecurityFileModel from 'irene/models/security/file';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import type IreneAjaxService from 'irene/services/ajax';

export interface SecurityFileSearchListDownloadComponentSignature {
  Args: {
    file: SecurityFileModel;
  };
}

export default class SecurityFileSearchListDownloadComponent extends Component<SecurityFileSearchListDownloadComponentSignature> {
  @service('notifications') declare notify: NotificationService;
  @service('browser/window') declare window: Window;
  @service('intl') declare intl: IntlService;
  @service declare ajax: IreneAjaxService;

  get file() {
    return this.args.file;
  }

  @action downloadApp() {
    this.triggerDownloadApp.perform();
  }

  triggerDownloadApp = task(async () => {
    try {
      const fileId = this.file.id;
      const url = [ENV.endpoints['apps'], fileId].join('/');

      const data = (await this.ajax.request(url, {
        namespace: 'api/hudson-api',
      })) as { url: string };

      this.window.open(data.url, '_blank');
    } catch (e) {
      this.notify.error(parseError(e, this.intl.t('pleaseTryAgain')));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileSearchList::Download': typeof SecurityFileSearchListDownloadComponent;
    'security/file-search-list/download': typeof SecurityFileSearchListDownloadComponent;
  }
}
