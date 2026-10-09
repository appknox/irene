import type { AsyncHasMany } from '@ember-data/model';
import Model, { attr, hasMany } from '@ember-data/model';
import type FileModel from './file';
import type {
  VulnerabilitySlaSeverity,
  VulnerabilitySlaWindow,
} from 'irene/utils/vulnerability-sla';

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
  show_dora: ValueObject;
  show_eucra: ValueObject;
}

export type SaveReportPreferenceData = Pick<
  ProfileReportPreference,
  'show_api_scan' | 'show_dynamic_scan' | 'show_manual_scan'
>;

export type SetProfileRegulatorPrefData = { value: boolean };

export type SaveKnoxIqAutomatedTriggerData = { status: boolean };

export type ProfileRegulatoryReportPreference =
  | 'pcidss'
  | 'hipaa'
  | 'gdpr'
  | 'nist'
  | 'sama'
  | 'dora'
  | 'eucra';

type ProfileAdapterName = 'profile';

export default class ProfileModel extends Model {
  private adapterName = ProfileModel.modelName as ProfileAdapterName;

  @attr('boolean')
  declare showUnknownAnalysis: boolean;

  @attr('boolean')
  declare knoxiqAutomatedTrigger: boolean;

  @hasMany('file', { inverse: 'profile', async: true })
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

  getSlaPolicy() {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.getSlaPolicy(this);
  }

  setSlaPolicySeverity(
    severity: VulnerabilitySlaSeverity,
    data: VulnerabilitySlaWindow
  ) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.setSlaPolicySeverity(this, severity, data);
  }

  resetSlaPolicySeverity(severity: VulnerabilitySlaSeverity) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.resetSlaPolicySeverity(this, severity);
  }

  saveKnoxIqAutomatedTrigger(data: SaveKnoxIqAutomatedTriggerData) {
    const adapter = this.store.adapterFor(this.adapterName);

    return adapter.saveKnoxIqAutomatedTrigger(this, data);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    profile: ProfileModel;
  }
}
