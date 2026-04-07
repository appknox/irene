import CommonDRFAdapter from './commondrf';

import type { PiiUpdatePayload } from 'irene/models/privacy-pii-settings';

export default class PrivacyPiiSettingsAdapter extends CommonDRFAdapter {
  _buildURL() {
    const baseURL = `${this.namespace_v2}/privacy_pii_settings`;

    return this.buildURLFromBase(baseURL);
  }

  savePiiSettings(
    modelName: string,
    settingsId: string,
    updateData: PiiUpdatePayload
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
    'privacy-pii-settings': PrivacyPiiSettingsAdapter;
  }
}
