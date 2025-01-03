import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitForPromise } from '@ember/test-waiters';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type SecurityFileModel from 'irene/models/security/file';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsActionsSignature {
  Element: HTMLElement;
  Args: {
    file: SecurityFileModel;
  };
}

type DownloadAppResponse = {
  url: string;
};

export default class FileDetailsActionsComponent extends Component<FileDetailsActionsSignature> {
  @service declare intl: IntlService;
  @service declare store: Store;
  @service declare notifications: NotificationService;
  @service('browser/window') declare window: Window;
  @service declare ajax: IreneAjaxService;

  get packageName() {
    return this.file.project.get('packageName');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  // to String because power-select has issues with 0
  // https://github.com/cibernox/ember-power-select/issues/962
  get manualToString() {
    const manual = this.file.manual;
    return String(manual);
  }

  get manualStatuses() {
    return ENUMS.MANUAL.CHOICES.filter((c) => c.key !== 'UNKNOWN').map((c) =>
      String(c.value)
    );
  }

  get file() {
    return this.args.file;
  }

  get fileId() {
    return this.file.get('id');
  }

  get ireneFilePath() {
    const fileId = this.file.id;
    const ireneHost = ENV.ireneHost;

    return [ireneHost, 'dashboard/file', fileId].join('/');
  }

  get scanStatusesList() {
    return [
      {
        label: 'Is API done',
        onChecboxClick: this.updateAPIScanStatus,
        checked: this.file.isApiDone,
        isSaving: this.setApiScanStatus.isRunning,
      },
      {
        label: 'Is Dynamic done',
        onChecboxClick: this.updateDynamicScanStatus,
        checked: this.file.isDynamicDone,
        isSaving: this.setDynamicDone.isRunning,
      },
    ];
  }

  get isManualScanAvailable() {
    return this.file.project.get('isManualScanAvailable');
  }

  @action manualScanStatusText(status: string) {
    const statusLabels = {
      [ENUMS.MANUAL.NONE]: 'Not Started',
      [ENUMS.MANUAL.REQUESTED]: 'Requested',
      [ENUMS.MANUAL.ASSESSING]: 'In Progress',
      [ENUMS.MANUAL.DONE]: 'Completed',
    };

    return statusLabels[Number(status)] || '';
  }

  @action selectManualScan(status: number) {
    this.updateManualScan.perform(status);
  }

  @action goToDashboard() {
    this.window.open(this.ireneFilePath, '_blank');
  }

  @action downloadApp() {
    this.doDownloadApp.perform();
  }

  @action updateAPIScanStatus(event: MouseEvent) {
    const isAPIDone = (event.target as HTMLInputElement).checked;

    this.setApiScanStatus.perform(isAPIDone);
  }

  @action updateDynamicScanStatus(event: MouseEvent) {
    const isDynamicDone = (event.target as HTMLInputElement).checked;

    this.setDynamicDone.perform(isDynamicDone);
  }

  @action visitDashboard() {
    this.downloadAppModified.perform();
  }

  @action downloadModifiedAppVersion() {
    this.downloadAppModified.perform();
  }

  setApiScanStatus = task(async (isAPIDone: boolean) => {
    const apiScanStatus = isAPIDone
      ? ENUMS.SCAN_STATUS.COMPLETED
      : ENUMS.SCAN_STATUS.UNKNOWN;

    try {
      const file = this.file;
      file.set('apiScanStatus', apiScanStatus);

      await waitForPromise(file.save());

      this.notifications.success('Successfully saved the API scan status');
    } catch (err) {
      this.notifications.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  setDynamicDone = task(async (isDynamicDone: boolean) => {
    try {
      const file = this.file;
      file.set('isDynamicDone', isDynamicDone);

      await waitForPromise(file.save());

      this.notifications.success('Dynamic scan status updated');
    } catch (err) {
      this.notifications.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  updateManualScan = task(async (status) => {
    try {
      const file = this.file;
      file.set('manual', status);

      await waitForPromise(file.save());

      this.notifications.success('Manual Scan Status Updated');
    } catch (err) {
      this.notifications.error(parseError(err, this.tPleaseTryAgain));
    }
  });

  doDownloadApp = task(async () => {
    try {
      const url = [ENV.endpoints['apps'], this.fileId].join('/');

      const data = await this.ajax.request<DownloadAppResponse>(url, {
        namespace: 'api/hudson-api',
      });

      this.window.open(data.url, '_blank');
    } catch (err) {
      const error = err as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (error.errors && error.errors.length) {
        errMsg = error.errors[0]?.detail || errMsg;
      } else if (error.message) {
        errMsg = error.message;
      }

      this.notifications.error(errMsg);
    }
  });

  downloadAppModified = task(async () => {
    const url = [ENV.endpoints['apps'], this.fileId, 'modified'].join('/');

    const data = await this.ajax.request<DownloadAppResponse>(url, {
      namespace: 'api/hudson-api',
    });

    this.window.open(data.url, '_blank');
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Security::FileDetailsActions': typeof FileDetailsActionsComponent;
  }
}
