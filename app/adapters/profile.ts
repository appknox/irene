import commondrf from './commondrf';

import ProfileModel, {
  type ProfileRegulatoryReportPreference,
  type SaveReportPreferenceData,
  type SetProfileRegulatorPrefData,
  type SetProfileDSAutomatedDevicePrefData,
  SetProfileDSManualDevicePrefData,
} from 'irene/models/profile';

export default class ProfileAdapter extends commondrf {
  async setDSManualDevicePrefData(
    modelInstance: ProfileModel,
    data: SetProfileDSManualDevicePrefData
  ) {
    const modelId = modelInstance.get('id');

    const url =
      this.buildURL('profile', modelId) + '/ds_manual_device_preference';

    return this.ajax(url, 'PUT', { data });
  }

  async setDSAutomatedPrefData(
    modelInstance: ProfileModel,
    data: SetProfileDSAutomatedDevicePrefData
  ) {
    const modelId = modelInstance.get('id');

    const url =
      this.buildURL('profile', modelId) + '/ds_automated_device_preference';

    return this.ajax(url, 'PUT', { data });
  }

  async getDsManualDevicePreference(modelInstance: ProfileModel) {
    const modelId = modelInstance.get('id');

    const url =
      this.buildURL('profile', modelId) + '/ds_manual_device_preference';

    return this.ajax(url, 'GET');
  }

  async getDsAutomatedDevicePreference(modelInstance: ProfileModel) {
    const modelId = modelInstance.get('id');

    const url =
      this.buildURL('profile', modelId) + '/ds_automated_device_preference';

    return this.ajax(url, 'GET');
  }

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
