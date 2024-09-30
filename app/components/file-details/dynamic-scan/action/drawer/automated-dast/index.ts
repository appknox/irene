// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';

import type IntlService from 'ember-intl/services/intl';
import type Store from '@ember-data/store';
import type ApiScanOptionsModel from 'irene/models/api-scan-options';
import type { DevicePreferenceContext } from 'irene/components/project-preferences/provider';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import type FileModel from 'irene/models/file';
import type ProxySettingModel from 'irene/models/proxy-setting';

type ProjectScenariosArrayResponse =
  DS.AdapterPopulatedRecordArray<ScanParameterGroupModel>;

export interface FileDetailsDynamicScanDrawerAutomatedDastSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DevicePreferenceContext;
    enableApiScan(event: Event, checked: boolean): void;
  };
}

export default class FileDetailsDynamicScanDrawerAutomatedDastComponent extends Component<FileDetailsDynamicScanDrawerAutomatedDastSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service('notifications') declare notify: NotificationService;

  @tracked apiScanOptions?: ApiScanOptionsModel;
  @tracked projectScenarios: ProjectScenariosArrayResponse | null = null;
  @tracked proxy?: ProxySettingModel;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanDrawerAutomatedDastSignature['Args']
  ) {
    super(owner, args);

    this.fetchApiScanOptions.perform();
    this.fetchProjectScenarios.perform();
    this.fetchProxySetting.perform();
  }

  get file() {
    return this.args.file;
  }

  get dpContext() {
    return this.args.dpContext;
  }

  get profileId() {
    return this.file.profile.get('id');
  }

  get apiUrlFilters() {
    return (this.apiScanOptions?.apiUrlFilterItems || []).map((url) => ({
      url,
    }));
  }

  get activeScenarioList() {
    return this.projectScenarios?.filter((s) => s.isActive) || [];
  }

  get showEmptyScenarioListUI() {
    return Number(this.activeScenarioList?.length) < 1;
  }

  get showEmptyAPIURLFilterListUI() {
    return Number(this.apiUrlFilters?.length) < 1;
  }

  get prjPlatformDisplay() {
    return this.file.project.get('platformDisplay');
  }

  get fileMinOSVersion() {
    return this.file.minOsVersion;
  }

  get automatedDastDevicePreferences() {
    return this.dpContext.dsAutomatedDevicePreference;
  }

  get minOSVersion() {
    const version =
      this.automatedDastDevicePreferences?.ds_automated_platform_version_min;

    return isEmpty(version) ? '-' : version;
  }

  get devicePrefInfoData() {
    return [
      {
        id: 'selectedPref',
        title: this.intl.t('modalCard.dynamicScan.selectedPref'),
        value: this.intl.t(
          dsAutomatedDevicePref([
            Number(
              this.automatedDastDevicePreferences
                ?.ds_automated_device_selection ||
                ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA
            ),
          ])
        ),
      },
      {
        id: 'minOSVersion',
        title: this.intl.t('minOSVersion'),
        value: this.minOSVersion,
      },
    ];
  }

  get apiProxyIsEnabled() {
    return !!this.proxy?.enabled;
  }

  fetchApiScanOptions = task(async () => {
    this.apiScanOptions = await this.store.queryRecord('api-scan-options', {
      id: this.profileId,
    });
  });

  fetchProjectScenarios = task(async () => {
    try {
      this.projectScenarios = (await this.store.query('scan-parameter-group', {
        projectId: this.args.file.project?.get('id'),
      })) as ProjectScenariosArrayResponse;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchProxySetting = task(async () => {
    try {
      const profileId = this.file.profile.get('id');

      if (profileId) {
        this.proxy = await this.store.findRecord('proxy-setting', profileId);
      }
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast': typeof FileDetailsDynamicScanDrawerAutomatedDastComponent;
  }
}
