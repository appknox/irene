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
import { ProfileDynamicScanMode } from 'irene/models/profile';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';

import type FileModel from 'irene/models/file';
import { type DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type ProjectAvailableDeviceModel from 'irene/models/project-available-device';
import type IreneAjaxService from 'irene/services/ajax';

export interface FileDetailsDynamicScanActionDrawerSignature {
  Args: {
    onClose: () => void;
    pollDynamicStatus: () => void;
    file: FileModel;
    isAutomatedScan?: boolean;
    dpContext: DevicePreferenceContext;
  };
}

export default class FileDetailsDynamicScanActionDrawerComponent extends Component<FileDetailsDynamicScanActionDrawerSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('notifications') declare notify: NotificationService;

  @tracked isApiScanEnabled = false;
  @tracked allAvailableManualDevices: ProjectAvailableDeviceModel[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanActionDrawerSignature['Args']
  ) {
    super(owner, args);

    if (!this.args.isAutomatedScan) {
      this.fetchAllAvailableManualDevices.perform();
    }
  }

  get file() {
    return this.args.file;
  }

  get projectId() {
    return this.file.project.get('id');
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
    return this.args.dpContext?.dsManualDevicePreference
      ?.ds_manual_device_identifier;
  }

  get selectedManualDeviceIsInAvailableDeviceList() {
    return (
      this.allAvailableManualDevices.findIndex(
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
        dpContext.dsManualDevicePreference?.ds_manual_device_selection;

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

  fetchAllAvailableManualDevices = task(async (manualDevices = true) => {
    try {
      const query = {
        projectId: this.projectId,
        manualDevices,
      };

      const availableDevices = await this.store.query(
        'project-available-device',
        query
      );

      this.allAvailableManualDevices = availableDevices.slice();
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer': typeof FileDetailsDynamicScanActionDrawerComponent;
  }
}
