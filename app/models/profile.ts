import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';

import type FileModel from './file';

export enum ProfileDynamicScanMode {
  MANUAL = 'Manual',
  AUTOMATED = 'Automated',
}

export enum ProfilleCapabilitiesTranslationsMap {
  dsAutomatedSimRequired = 'sim',
  dsAutomatedVpnRequired = 'vpn',
  dsAutomatedPinLockRequired = 'pinLock',
}

interface ValueObject {
  value: boolean;
  is_inherited: boolean;
}

export interface ProfileReportPreference {
  show_static_scan: boolean;
  show_dynamic_scan: boolean;
  show_api_scan: boolean;
  show_manual_scan: boolean;
  show_pcidss: ValueObject;
  show_hipaa: ValueObject;
  show_gdpr: ValueObject;
  show_nist: ValueObject;
  show_sama: ValueObject;
}

export type SaveReportPreferenceData = Pick<
  ProfileReportPreference,
  'show_api_scan' | 'show_dynamic_scan' | 'show_manual_scan'
>;

export type SetProfileRegulatorPrefData = { value: boolean };

export type ProfileDSManualDevicePrefData = {
  id: string;
  ds_manual_device_selection: number;
  ds_manual_device_identifier: string;
};

export type SetProfileDSManualDevicePrefData = Partial<
  Omit<ProfileDSManualDevicePrefData, 'id'>
>;

export type ProfileDSAutomatedDevicePrefData = {
  id: string;
  ds_automated_device_selection: number;
  ds_automated_device_type: number;
  ds_automated_device_identifier: string;
  ds_automated_platform_version_min: string;
  ds_automated_platform_version_max: string;
  ds_automated_sim_required: boolean;
  ds_automated_pin_lock_required: boolean;
  ds_automated_vpn_required: boolean;
  ds_automated_use_reserved_device: boolean;
};

export type SetProfileDSAutomatedDevicePrefData = Partial<
  Omit<ProfileDSAutomatedDevicePrefData, 'id'>
>;

export type ProfileRegulatoryReportPreference =
  | 'pcidss'
  | 'hipaa'
  | 'gdpr'
  | 'nist'
  | 'sama';

type ProfileAdapterName = 'profile';

export default class ProfileModel extends Model {
  private adapterName = ProfileModel.modelName as ProfileAdapterName;

  @attr('boolean')
  declare showUnknownAnalysis: boolean;

  @attr
  declare dynamicScanMode: ProfileDynamicScanMode;

  // Manual Scan
  @attr('string')
  declare dsManualDeviceIdentifier: string;

  @attr
  declare dsManualDeviceSelection: number;

  // Automated Scan
  @attr('string')
  declare dsAutomatedDeviceIdentifier: string;

  @attr('string')
  declare dsAutomatedPlatformVersionMin: string;

  @attr('string')
  declare dsAutomatedPlatformVersionMax: string;

  @attr('boolean')
  declare dsAutomatedSimRequired: boolean;

  @attr('boolean')
  declare dsAutomatedPinLockRequired: boolean;

  @attr('boolean')
  declare dsAutomatedVpnRequired: boolean;

  @attr('boolean')
  declare dsAutomatedUseReservedDevice: boolean;

  @attr
  declare dsAutomatedDeviceSelection: number;

  @attr
  declare dsAutomatedDeviceType: number;

  @hasMany('file', { inverse: 'profile', async: true })
  declare files: AsyncHasMany<FileModel>;

  @attr
  declare reportPreference: ProfileReportPreference;

  get profileCapabilities() {
    return Object.keys(ProfilleCapabilitiesTranslationsMap).reduce(
      (capabilities, key) => {
        const type = key as keyof typeof ProfilleCapabilitiesTranslationsMap;

        if (this[type]) {
          capabilities.push(ProfilleCapabilitiesTranslationsMap[type]);
        }

        return capabilities;
      },
      [] as string[]
    );
  }

  saveReportPreference(data: SaveReportPreferenceData) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.saveReportPreference(this, data);
  }

  setShowPreference(
    preference: ProfileRegulatoryReportPreference,
    data: SetProfileRegulatorPrefData
  ) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setShowPreference(this, preference, data);
  }

  unsetShowPreference(preference: ProfileRegulatoryReportPreference) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.unsetShowPreference(this, preference);
  }

  getDsManualDevicePreference(): Promise<ProfileDSManualDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.getDsManualDevicePreference(this);
  }

  getDsAutomatedDevicePreference(): Promise<ProfileDSAutomatedDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.getDsAutomatedDevicePreference(this);
  }

  setDSManualDevicePrefData(
    data: SetProfileDSManualDevicePrefData
  ): Promise<ProfileDSManualDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setDSManualDevicePrefData(this, data);
  }

  setDSAutomatedDevicePrefData(
    data: SetProfileDSAutomatedDevicePrefData
  ): Promise<ProfileDSAutomatedDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setDSAutomatedDevicePrefData(this, data);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    profile: ProfileModel;
  }
}
