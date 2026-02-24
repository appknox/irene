import Model, { attr } from '@ember-data/model';

interface GeoSettingItem {
  value: boolean;
  settings_parameter: string;
}

export interface GeoUpdatePayload {
  geo_custom_countries?: string[];
  [key: string]: boolean | string[] | undefined;
}

export type PiiModelName = 'privacy-server-location-settings';

export default class PrivacyServerLocationSettingsModel extends Model {
  private modelName =
    PrivacyServerLocationSettingsModel.modelName as PiiModelName;

  @attr()
  declare customCountries: string[];

  @attr('number')
  declare version: number;

  @attr()
  declare geoSettings: GeoSettingItem[];

  async saveServerLocationSettings(id: string, obj: GeoUpdatePayload) {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.saveServerLocationSettings(this.modelName, id, obj);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'privacy-server-location-settings': PrivacyServerLocationSettingsModel;
  }
}
