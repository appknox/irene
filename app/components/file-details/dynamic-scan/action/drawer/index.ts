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
import type DynamicscanModel from 'irene/models/dynamicscan';
import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';

export interface FileDetailsDynamicScanActionDrawerSignature {
  Args: {
    dpContext: DsPreferenceContext;
    onClose: () => void;
    onScanStart: (dynamicscan: DynamicscanModel) => void;
    file: FileModel;
    isAutomatedScan?: boolean;
  };
}

export default class FileDetailsDynamicScanActionDrawerComponent extends Component<FileDetailsDynamicScanActionDrawerSignature> {
  @service declare intl: IntlService;
  @service declare ajax: any;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked isApiCaptureEnabled = false;

  get file() {
    return this.args.file;
  }

  get projectId() {
    return this.file.project.get('id');
  }

  get profileId() {
    return this.file.profile.get('id') as string;
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

  get dsManualDeviceIdentifier() {
    return this.args.dpContext.dsManualDevicePreference
      ?.dsManualDeviceIdentifier;
  }

  get selectedManualDeviceIsInAvailableDeviceList() {
    return (
      this.args.dpContext.availableManualDevices
        ?.slice()
        ?.findIndex(
          (d) => d.deviceIdentifier === this.dsManualDeviceIdentifier
        ) !== -1
    );
  }

  get enableStartDynamicScanBtn() {
    const { isAutomatedScan, dpContext } = this.args;

    if (!isAutomatedScan) {
      const anyDeviceSelection = ENUMS.DS_MANUAL_DEVICE_SELECTION.ANY_DEVICE;

      const specificDeviceSelection =
        ENUMS.DS_MANUAL_DEVICE_SELECTION.SPECIFIC_DEVICE;

      const dsManualDeviceSelection =
        dpContext.dsManualDevicePreference?.dsManualDeviceSelection;

      return (
        dsManualDeviceSelection === anyDeviceSelection ||
        (specificDeviceSelection === dsManualDeviceSelection &&
          !isEmpty(this.dsManualDeviceIdentifier) &&
          this.selectedManualDeviceIsInAvailableDeviceList)
      );
    }

    return true;
  }

  @action
  handleApiCaptureChange(_: Event, checked: boolean) {
    this.isApiCaptureEnabled = !!checked;
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
        ? ENUMS.DYNAMIC_MODE.AUTOMATED
        : ENUMS.DYNAMIC_MODE.MANUAL;

      const data = {
        mode,
        enable_api_capture: this.isApiCaptureEnabled,
      };

      const dynamicUrl = [
        ENV.endpoints['files'],
        this.file.id,
        ENV.endpoints['dynamicscans'],
      ].join('/');

      const res = await this.ajax.post(dynamicUrl, {
        namespace: ENV.namespace_v2,
        data,
      });

      const normalized = this.store.normalize('dynamicscan', res);

      this.args.onScanStart(this.store.push(normalized) as DynamicscanModel);

      this.args.onClose();

      this.notify.success(this.tStartingScan);
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));

      this.args.file.setDynamicStatusNone();
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer': typeof FileDetailsDynamicScanActionDrawerComponent;
  }
}
