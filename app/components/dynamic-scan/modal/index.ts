import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';

import ENV from 'irene/config/environment';
import triggerAnalytics from 'irene/utils/trigger-analytics';
import ENUMS from 'irene/enums';
import parseError from 'irene/utils/parse-error';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type FileModel from 'irene/models/file';
import { type DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import { ProfileDynamicScanMode } from 'irene/models/profile';

export interface DynamicScanModalSignature {
  Args: {
    onClose: () => void;
    pollDynamicStatus: () => void;
    file: FileModel;
    isAutomatedScan?: boolean;
    dpContext: DevicePreferenceContext;
  };
}

export default class DynamicScanModalComponent extends Component<DynamicScanModalSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked isApiScanEnabled = false;

  get file() {
    return this.args.file;
  }

  get tStartingScan() {
    return this.intl.t('startingScan');
  }

  get tPleaseTryAgain() {
    return this.intl.t('pleaseTryAgain');
  }

  get disableCloseDastModal() {
    return this.startDynamicScan.isRunning;
  }

  get enableStartDynamicScanBtn() {
    const { isAutomatedScan, dpContext } = this.args;

    if (!isAutomatedScan) {
      const anyDeviceSelection = ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE;

      const specificDeviceSelection =
        ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE;

      const dsManualDeviceSelection =
        dpContext.projectProfile?.dsManualDeviceSelection;

      return (
        dsManualDeviceSelection === anyDeviceSelection ||
        (specificDeviceSelection === dsManualDeviceSelection &&
          !isEmpty(dpContext.dsManualDeviceId))
      );
    }

    return true;
  }

  @action
  enableApiScan(_: Event, checked: boolean) {
    this.isApiScanEnabled = !!checked;
  }

  @action
  runDynamicScan() {
    triggerAnalytics(
      'feature',
      ENV.csb['runDynamicScan'] as CsbAnalyticsFeatureData
    );

    this.startDynamicScan.perform();
  }

  startDynamicScan = task(async () => {
    try {
      const mode = this.args.isAutomatedScan
        ? ProfileDynamicScanMode.AUTOMATED
        : ProfileDynamicScanMode.MANUAL;

      const data = {
        mode,
        enable_api_capture: this.isApiScanEnabled,
      };

      const dynamicUrl = [
        ENV.endpoints['files'],
        this.file.id,
        ENV.endpoints['dynamicscans'],
      ].join('/');

      await this.ajax.post(dynamicUrl, { namespace: ENV.namespace_v2, data });

      this.args.onClose();

      this.file.setBootingStatus();

      this.args.pollDynamicStatus();

      this.notify.success(this.tStartingScan);
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));

      this.args.file.setDynamicStatusNone();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'DynamicScan::Modal': typeof DynamicScanModalComponent;
  }
}
