import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import IntlService from 'ember-intl/services/intl';
import Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import FileModel from 'irene/models/file';

export interface FileDetailsDynamicScanDrawerOldSignature {
  Args: {
    onClose: () => void;
    pollDynamicStatus: () => void;
    file: FileModel;
  };
}

export default class FileDetailsDynamicScanDrawerOldComponent extends Component<FileDetailsDynamicScanDrawerOldSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked showApiScanSettings = false;
  @tracked isApiScanEnabled = false;

  get tStartingScan() {
    return this.intl.t('startingScan');
  }

  get tScheduleDynamicscanSuccess() {
    return this.intl.t('scheduleDynamicscanSuccess');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get projectPlatform() {
    return this.args.file.project.get('platform');
  }

  get profileId() {
    return this.args.file.profile.get('id');
  }

  get deviceRequirements() {
    const file = this.args.file;

    return [
      {
        type: this.intl.t('modalCard.dynamicScan.osVersion'),
        boldValue: `${file.project.get('platformDisplay')} ${
          file.minOsVersion
        } `,
        value: this.intl.t('modalCard.dynamicScan.orAbove'),
      },
      file.supportedCpuArchitectures && {
        type: this.intl.t('modalCard.dynamicScan.processorArchitecture'),
        boldValue: file.supportedCpuArchitectures,
      },
      file.supportedDeviceTypes && {
        type: this.intl.t('modalCard.dynamicScan.deviceTypes'),
        boldValue: file.supportedDeviceTypes,
      },
    ].filter(Boolean) as { type: string; boldValue: string; value?: string }[];
  }

  @action
  enableApiScan(event: Event, checked: boolean) {
    this.showApiScanSettings = checked;
    this.isApiScanEnabled = !!checked;
  }

  startDynamicScan = task(async () => {
    try {
      const data = {
        isApiScanEnabled: this.isApiScanEnabled === true,
      };

      const file = this.args.file;
      const dynamicUrl = [ENV.endpoints['dynamic'], file.id].join('/');

      await this.ajax.put(dynamicUrl, { data });

      this.args.onClose();

      file.setBootingStatus();

      this.args.pollDynamicStatus();

      this.notify.success(this.tStartingScan);
    } catch (error) {
      const err = error as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (err.errors && err.errors.length) {
        errMsg = err.errors[0]?.detail || errMsg;
      } else if (err.payload.message) {
        errMsg = err.payload.message;
      } else if (err.message) {
        errMsg = err.message;
      }

      this.notify.error(errMsg);

      this.args.file.setDynamicStatusNone();
    }
  });

  scheduleDynamicScan = task({ drop: true }, async () => {
    try {
      const file = this.args.file;

      const scheduleAutomationUrl = [
        ENV.endpoints['dynamic'],
        file.id,
        ENV.endpoints['scheduleDynamicscanAutomation'],
      ].join('/');

      await this.ajax.post(scheduleAutomationUrl, {
        data: { id: file.id },
      });

      file.setInQueueStatus();

      this.args.onClose();

      this.notify.success(this.tScheduleDynamicscanSuccess, {
        clearDuration: 5000,
      });
    } catch (e) {
      const err = e as AdapterError;
      let errMsg = this.tPleaseTryAgain;

      if (err.payload) {
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

  @action
  runDynamicScan() {
    triggerAnalytics(
      'feature',
      ENV.csb['runDynamicScan'] as CsbAnalyticsFeatureData
    );

    this.startDynamicScan.perform();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::DrawerOld': typeof FileDetailsDynamicScanDrawerOldComponent;
  }
}
