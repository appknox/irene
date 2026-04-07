import type { GeoUpdatePayload } from 'irene/models/privacy-server-location-settings';
import CommonDRFAdapter from './commondrf';

export default class PrivacyServerLocationSettingsAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseURL = `${this.namespace_v2}/privacy_geo_settings`;

    return this.buildURLFromBase(baseURL);
  }

  saveServerLocationSettings(
    modelName: string,
    settingsId: string,
    updateData: GeoUpdatePayload
  ) {
    const baseURL = this._buildURL();
    const url = `${baseURL}/${settingsId}`;

    return this.ajax(url, 'PUT', {
      contentType: 'application/json',
      data: updateData,
    }) as Promise<{ success: boolean }>;
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    'privacy-server-location-settings': PrivacyServerLocationSettingsAdapter;
  }
}
