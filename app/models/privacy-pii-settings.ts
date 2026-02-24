import Model, { attr } from '@ember-data/model';

export type PiiModelName = 'privacy-pii-settings';

interface PiiSettingItem {
  value: boolean;
  settings_parameter: string;
}

export interface PiiUpdatePayload {
  [key: string]: boolean | string[] | undefined;
}

export default class PrivacyPiiSettingsModel extends Model {
  private modelName = PrivacyPiiSettingsModel.modelName as PiiModelName;

  @attr('boolean')
  declare maskPii: boolean;

  @attr()
  declare customRegex: string[];

  @attr('number')
  declare version: number;

  @attr()
  declare piiSettings: PiiSettingItem[];

  async savePiiSettings(id: string, obj: PiiUpdatePayload) {
    const adapter = this.store.adapterFor(this.modelName);

    return adapter.savePiiSettings(this.modelName, id, obj);
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'privacy-pii-settings': PrivacyPiiSettingsModel;
  }
}
