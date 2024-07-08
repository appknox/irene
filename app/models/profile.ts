import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';

import type FileModel from './file';

export enum ProfileDynamicScanMode {
  MANUAL = 'Manual',
  AUTOMATED = 'Automated',
}

export enum ProfileDsManualDeviceSelection {
  ANY_DEVICE = 0,
  SPECIFIC_DEVICE = 1,
}

export enum ProfileDsAutomatedDeviceSelection {
  ANY_DEVICE = 0,
  FILTER_CRITERIA = 1,
}

export enum ProfileDsAutomatedDeviceType {
  NO_PREFERENCE = 0,
  PHONE_REQUIRED = 1,
  TABLET_REQUIRED = 2,
}

export enum ProfileDsAutomatedDeviceCapabilityPropKeyMap {
  'dsAutomatedVpnRequired' = 'ds_automated_vpn_required',
  'dsAutomatedSimRequired' = 'ds_automated_sim_required',
  'dsAutomatedPinLockRequired' = 'ds_automated_pin_lock_required',
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
}

export type SaveReportPreferenceData = Pick<
  ProfileReportPreference,
  'show_api_scan' | 'show_dynamic_scan' | 'show_manual_scan'
>;

export type SetProfileRegulatorPrefData = { value: boolean };

export type ProfileDSManualDevicePrefData = {
  id: string;
  ds_manual_device_selection: ProfileDsManualDeviceSelection;
  ds_manual_device_identifier: string;
};

export type SetProfileDSManualDevicePrefData = Partial<
  Omit<ProfileDSManualDevicePrefData, 'id'>
>;

export type ProfileDSAutomatedDevicePrefData = {
  id: string;
  ds_automated_device_selection: ProfileDsAutomatedDeviceSelection;
  ds_automated_device_type: ProfileDsAutomatedDeviceType;
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
  | 'nist';

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
  declare dsManualDeviceSelection: ProfileDsManualDeviceSelection;

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
  declare dsAutomatedDeviceSelection: ProfileDsAutomatedDeviceSelection;

  @attr
  declare dsAutomatedDeviceType: ProfileDsAutomatedDeviceType;

  @hasMany('file', { inverse: 'profile' })
  declare files: AsyncHasMany<FileModel>;

  @attr
  declare reportPreference: ProfileReportPreference;

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

  getDSManualDevicePrefData(): Promise<ProfileDSManualDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.getDsManualDevicePreference(this);
  }

  getDSAutomatedPrefData(): Promise<ProfileDSAutomatedDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.getDsAutomatedDevicePreference(this);
  }

  setDSManualDevicePrefData(
    data: SetProfileDSManualDevicePrefData
  ): Promise<ProfileDSManualDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setDSManualDevicePrefData(this, data);
  }

  setDSAutomatedPrefData(
    data: SetProfileDSAutomatedDevicePrefData
  ): Promise<ProfileDSAutomatedDevicePrefData> {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setDSAutomatedPrefData(this, data);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    profile: ProfileModel;
  }
}
