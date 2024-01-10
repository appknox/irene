import commondrf from './commondrf';

import ProfileModel, {
  ProfileRegulatoryReportPreference,
  SaveReportPreferenceData,
  SetProfileRegulatorPrefData,
} from 'irene/models/profile';

export default class ProfileAdapter extends commondrf {
  async saveReportPreference(
    modelInstance: ProfileModel,
    data: SaveReportPreferenceData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/report_preference';

    await this.ajax(url, 'PUT', { data: data });

    return this.store.findRecord('profile', modelId);
  }

  async setShowPreference(
    modelInstance: ProfileModel,
    preference: ProfileRegulatoryReportPreference,
    data: SetProfileRegulatorPrefData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + `/show_${preference}`;

    await this.ajax(url, 'PUT', { data });

    return this.store.findRecord('profile', modelId);
  }

  async unsetShowPreference(
    modelInstance: ProfileModel,
    preference: ProfileRegulatoryReportPreference
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + `/show_${preference}`;

    await this.ajax(url, 'DELETE');

    return this.store.findRecord('profile', modelId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    profile: ProfileAdapter;
  }
}
