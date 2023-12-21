/* eslint-disable ember/no-observers */
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import Store from '@ember-data/store';
import IntlService from 'ember-intl/services/intl';
import { addObserver, removeObserver } from '@ember/object/observers';
import { tracked } from '@glimmer/tracking';

import AmAppVersionModel from 'irene/models/am-app-version';
import ENV from 'irene/config/environment';
import parseError from 'irene/utils/parse-error';
import SubmissionModel from 'irene/models/submission';
import RealtimeService from 'irene/services/realtime';
import FileModel from 'irene/models/file';

interface AppMonitoringVersionTableActionsSignature {
  Args: {
    amAppVersion: AmAppVersionModel;
  };
}

export default class AppMonitoringVersionTableActionsComponent extends Component<AppMonitoringVersionTableActionsSignature> {
  @service declare ajax: any;
  @service('notifications') declare notify: NotificationService;
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare realtime: RealtimeService;

  @tracked relatedVersionSubmissionRecord: SubmissionModel | null = null;
  @tracked showAppUploadState = false;
  @tracked showErrorDetailsModal = false;

  // constructor(
  //   owner: unknown,
  //   args: AppMonitoringVersionTableActionsSignature['Args']
  // ) {
  //   super(owner, args);
  // }

  get amAppVersion() {
    return this.args.amAppVersion;
  }

  get isScanned() {
    return this.amAppVersion.get('latestFile').get('id');
  }

  get submissionStatus() {
    return this.relatedVersionSubmissionRecord?.submissionStatus;
  }

  get appIsAnalyzing() {
    return !this.submissionStatus?.running && !this.submissionStatus?.failed;
  }

  get showNoActionText() {
    return !this.showAppUploadState && this.isScanned;
  }

  @action triggerInitiateUpload() {
    this.initiateUpload.perform();
  }

  retryAppVersionUpload = task(async () => {
    await this.initiateUpload.perform();
    this.toggleShowErrorDetailsModal();
  });

  @action toggleShowErrorDetailsModal() {
    this.showErrorDetailsModal = !this.showErrorDetailsModal;
  }

  @action reloadAmAppVersion() {
    if (this.appIsAnalyzing) {
      this.reloadVersion.perform();
    }
  }

  reloadVersion = task(async () => {
    await this.amAppVersion.reload();
  });

  initiateUpload = task(async () => {
    try {
      const URL = `${ENV.endpoints['amAppVersions']}/${this.amAppVersion.id}/initiate_upload`;
      const data = (await this.ajax.post(URL)) as {
        id: number;
        status: number;
      };

      this.relatedVersionSubmissionRecord = await this.store.findRecord(
        'submission',
        data.id
      );

      this.showAppUploadState = true;

      addObserver(
        this.relatedVersionSubmissionRecord,
        'status',
        this,
        this.reloadAmAppVersion
      );
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  willDestroy(): void {
    super.willDestroy();

    if (this.relatedVersionSubmissionRecord) {
      removeObserver(
        this.relatedVersionSubmissionRecord,
        'status',
        this,
        this.reloadAmAppVersion
      );
    }
  }
}
