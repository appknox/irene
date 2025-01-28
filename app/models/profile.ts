import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';
import type FileModel from './file';

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
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    profile: ProfileModel;
  }
}
