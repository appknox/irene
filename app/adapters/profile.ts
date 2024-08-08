import commondrf from './commondrf';

import ProfileModel, {
  type ProfileRegulatoryReportPreference,
  type SaveReportPreferenceData,
  type SetProfileRegulatorPrefData,
  type SetProfileDSAutomatedDevicePrefData,
  type SetProfileDSManualDevicePrefData,
} from 'irene/models/profile';

export default class ProfileAdapter extends commondrf {
  _buildURL(_: string, id: string | number, namespace = this.namespace) {
    const baseurl = `${namespace}/profiles`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
  }

  buildDSManualDevicePrefUrl(modelId: string | number) {
    return (
      this._buildURL('profile', modelId, this.namespace_v2) +
      '/ds_manual_device_preference'
    );
  }

  buildDSAutomatedDevicePrefUrl(modelId: string | number) {
    return (
      this._buildURL('profile', modelId, this.namespace_v2) +
      '/ds_automated_device_preference'
    );
  }

  async setDSManualDevicePrefData(
    modelInstance: ProfileModel,
    data: SetProfileDSManualDevicePrefData
  ) {
    const url = this.buildDSManualDevicePrefUrl(modelInstance.get('id'));

    return this.ajax(url, 'PUT', { data });
  }

  async setDSAutomatedDevicePrefData(
    modelInstance: ProfileModel,
    data: SetProfileDSAutomatedDevicePrefData
  ) {
    const url = this.buildDSAutomatedDevicePrefUrl(modelInstance.get('id'));

    return this.ajax(url, 'PUT', { data });
  }

  async getDsManualDevicePreference(modelInstance: ProfileModel) {
    const url = this.buildDSManualDevicePrefUrl(modelInstance.get('id'));

    return this.ajax(url, 'GET');
  }

  async getDsAutomatedDevicePreference(modelInstance: ProfileModel) {
    const url = this.buildDSAutomatedDevicePrefUrl(modelInstance.get('id'));

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
