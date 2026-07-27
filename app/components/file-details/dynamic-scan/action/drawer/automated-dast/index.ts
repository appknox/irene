// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';

import Component from '@glimmer/component';
import { tracked } from 'tracked-built-ins';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import type IntlService from 'ember-intl/services/intl';
import type Store from 'ember-data/store';

import parseError from 'irene/utils/parse-error';
import ENUMS from 'irene/enums';
import { dsAutomatedDevicePref } from 'irene/helpers/ds-automated-device-pref';
import { deviceType } from 'irene/helpers/device-type';
import type ApiScanOptionsModel from 'irene/models/api-scan-options';
import type { DsPreferenceContext } from 'irene/components/ds-preference-provider';
import type ScenarioModel from 'irene/models/scenario';
import type ScanParameterGroupModel from 'irene/models/scan-parameter-group';
import type FileModel from 'irene/models/file';
import type ProxySettingModel from 'irene/models/proxy-setting';
import type MeService from 'irene/services/me';
import type OrganizationService from 'irene/services/organization';

type ProjectScenariosArrayResponse =
  DS.AdapterPopulatedRecordArray<ScenarioModel>;

type ScanParameterGroupsArrayResponse =
  DS.AdapterPopulatedRecordArray<ScanParameterGroupModel>;

export interface FileDetailsDynamicScanDrawerAutomatedDastSignature {
  Element: HTMLElement;
  Args: {
    file: FileModel;
    dpContext: DsPreferenceContext;
  };
}

export default class FileDetailsDynamicScanDrawerAutomatedDastComponent extends Component<FileDetailsDynamicScanDrawerAutomatedDastSignature> {
  @service declare store: Store;
  @service declare intl: IntlService;
  @service declare me: MeService;
  @service declare organization: OrganizationService;
  @service('notifications') declare notify: NotificationService;

  @tracked apiScanOptions?: ApiScanOptionsModel;
  @tracked projectScenarios: ProjectScenariosArrayResponse | null = null;
  @tracked scanParameterGroups: ScanParameterGroupsArrayResponse | null = null;
  @tracked proxy: ProxySettingModel | null = null;

  constructor(
    owner: unknown,
    args: FileDetailsDynamicScanDrawerAutomatedDastSignature['Args']
  ) {
    super(owner, args);

    this.fetchApiScanOptions.perform();
    this.fetchProjectScenarios.perform();
    this.fetchScanParameterGroups.perform();
    this.fetchProxySetting.perform();
  }

  get isSuperUser() {
    return this.me.org?.has_security_permission;
  }

  get isAiDastEnabled() {
    return this.organization.selected?.aiFeatures?.ai_dast;
  }

  get showScanParameterGroups() {
    return !this.isAiDastEnabled;
  }

  get showV2Scenarios() {
    return this.isAiDastEnabled || this.isSuperUser;
  }

  get showSuperUserV2Label() {
    return !this.isAiDastEnabled && this.isSuperUser;
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

  get projectId() {
    return this.file.project.get('id');
  }

  get apiUrlFilters() {
    return (this.apiScanOptions?.dsApiCaptureFilters || []).map((url) => ({
      url,
    }));
  }

  get activeScenarioList() {
    return this.projectScenarios?.filter((s) => s.isActive) || [];
  }

  get showEmptyScenarioListUI() {
    return Number(this.activeScenarioList?.length) < 1;
  }

  get activeScanParameterGroupList() {
    return this.scanParameterGroups?.filter((s) => s.isActive) || [];
  }

  get showEmptyScanParameterGroupListUI() {
    return Number(this.activeScanParameterGroupList?.length) < 1;
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

  get isAnyDevicePrefSelected() {
    return (
      this.automatedDastDevicePreferences?.dsAutomatedDeviceSelection ===
      ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE
    );
  }

  get isSpecificDevicePrefSelected() {
    return (
      this.automatedDastDevicePreferences?.dsAutomatedDeviceSelection ===
      ENUMS.DS_AUTOMATED_DEVICE_SELECTION.FILTER_CRITERIA
    );
  }

  get minOSVersion() {
    const version =
      this.automatedDastDevicePreferences?.dsAutomatedPlatformVersionMin;

    return isEmpty(version) ? this.intl.t('anyVersion') : version;
  }

  get devicePrefInfoData() {
    return [
      {
        id: 'selectedPref',
        title: this.intl.t('modalCard.dynamicScan.selectedPref'),
        value: this.intl.t(
          dsAutomatedDevicePref([
            Number(
              this.automatedDastDevicePreferences?.dsAutomatedDeviceSelection ??
                ENUMS.DS_AUTOMATED_DEVICE_SELECTION.ANY_DEVICE
            ),
          ])
        ),
        hidden: this.isSpecificDevicePrefSelected,
      },
      {
        id: 'deviceType',
        title: this.intl.t('deviceType'),
        value: this.intl.t(
          deviceType([
            this.automatedDastDevicePreferences?.dsAutomatedDeviceType ??
              ENUMS.DS_DEVICE_TYPE.NO_PREFERENCE,
          ])
        ),
        hidden: this.isAnyDevicePrefSelected,
      },
      {
        id: 'minOSVersion',
        title: this.intl.t('minOSVersion'),
        value: this.minOSVersion,
        hidden: this.isAnyDevicePrefSelected,
      },
    ].filter((it) => !it.hidden);
  }

  get apiProxyIsEnabled() {
    return !!this.proxy?.enabled;
  }

  fetchApiScanOptions = task(async () => {
    try {
      this.apiScanOptions = await this.store.queryRecord('api-scan-options', {
        id: this.profileId,
      });
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchProjectScenarios = task(async () => {
    // early return if user is not a super user and AI DAST is disabled
    if (!this.showV2Scenarios) {
      return;
    }

    try {
      this.projectScenarios = (await this.store.query('scenario', {
        projectId: this.projectId,
      })) as ProjectScenariosArrayResponse;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchScanParameterGroups = task(async () => {
    // early return if user is not a super user and AI DAST is disabled
    if (!this.showScanParameterGroups) {
      return;
    }

    try {
      this.scanParameterGroups = (await this.store.query(
        'scan-parameter-group',
        { projectId: this.projectId }
      )) as ScanParameterGroupsArrayResponse;
    } catch (error) {
      this.notify.error(parseError(error));
    }
  });

  fetchProxySetting = task(async () => {
    // early return if profile ID is not available
    if (!this.profileId) {
      return;
    }

    try {
      this.proxy = await this.store.findRecord('proxy-setting', this.profileId);
    } catch (error) {
      const err = error as AdapterError;
      const errorStatus = err.errors?.[0]?.status;
      const isRateLimitError = Number(errorStatus) === 429;

      if (!isRateLimitError) {
        this.notify.error(parseError(error));
      }
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'FileDetails::DynamicScan::Action::Drawer::AutomatedDast': typeof FileDetailsDynamicScanDrawerAutomatedDastComponent;
  }
}
