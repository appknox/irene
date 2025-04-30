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

import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';
import type FileModel from 'irene/models/file';
import type AvailableManualDeviceModel from 'irene/models/available-manual-device';
import type IreneAjaxService from 'irene/services/ajax';
import type DynamicScanService from 'irene/services/dynamic-scan';

export interface FileDetailsDynamicScanActionDrawerSignature {
  Args: {
    dpContext: DsPreferenceContext;
    onClose: () => void;
    file: FileModel;
    isAutomatedScan?: boolean;
  };
}

export default class FileDetailsDynamicScanActionDrawerComponent extends Component<FileDetailsDynamicScanActionDrawerSignature> {
  @service declare intl: IntlService;
  @service declare ajax: IreneAjaxService;
  @service declare store: Store;
  @service('dynamic-scan') declare dynamicScanService: DynamicScanService;
  @service('notifications') declare notify: NotificationService;

  @tracked isApiCaptureEnabled = false;
  @tracked availableManualDevices: AvailableManualDeviceModel[] = [];

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanActionDrawerSignature['Args']
  ) {
    super(owner, args);

    if (!this.args.isAutomatedScan) {
      this.fetchAvailableManualDevices.perform();
    }
  }

  get file() {
    return this.args.file;
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
      this.availableManualDevices?.findIndex(
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

  fetchAvailableManualDevices = task(async () => {
    try {
      const adapter = this.store.adapterFor('available-manual-device');

      adapter.setNestedUrlNamespace(
        this.args.file.project?.get('id') as string
      );

      const devices = await this.store.query('available-manual-device', {
        platform_version_min: this.args.file.minOsVersion,
      });

      this.availableManualDevices = devices.slice();
    } catch (error) {
      this.notify.error(this.intl.t('errorFetchingAvailableDevices'));
    }
  });

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

      await this.ajax.post(dynamicUrl, {
        namespace: ENV.namespace_v2,
        data,
      });

      await this.file.reload();

      this.args.onClose();

      this.notify.success(this.tStartingScan);

      // Poll the dynamic scan status if the project org is different from the selected org
      // Only necessary for the case where the file is being accessed by a superuser
      await this.dynamicScanService.pollDynamicScanStatusForSuperUser({
        file: this.file,
        isAutomatedScan: this.args.isAutomatedScan,
      });
    } catch (error) {
      this.notify.error(parseError(error, this.tPleaseTryAgain));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer': typeof FileDetailsDynamicScanActionDrawerComponent;
  }
}
