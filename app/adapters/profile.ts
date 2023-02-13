import commondrf from './commondrf';

import ProfileModel, {
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

  async setShowPcidss(
    modelInstance: ProfileModel,
    data: SetProfileRegulatorPrefData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';

    await this.ajax(url, 'PUT', { data });

    return this.store.findRecord('profile', modelId);
  }

  async unsetShowPcidss(modelInstance: ProfileModel) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';

    await this.ajax(url, 'DELETE');

    return this.store.findRecord('profile', modelId);
  }

  async setShowHipaa(
    modelInstance: ProfileModel,
    data: SetProfileRegulatorPrefData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';

    await this.ajax(url, 'PUT', { data });

    return this.store.findRecord('profile', modelId);
  }

  async unsetShowHipaa(modelInstance: ProfileModel) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';

    await this.ajax(url, 'DELETE');

    return this.store.findRecord('profile', modelId);
  }

  async setShowGdpr(
    modelInstance: ProfileModel,
    data: SetProfileRegulatorPrefData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_gdpr';

    await this.ajax(url, 'PUT', { data });

    return this.store.findRecord('profile', modelId);
  }

  async unsetShowGdpr(modelInstance: ProfileModel) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_gdpr';

    await this.ajax(url, 'DELETE');

    return this.store.findRecord('profile', modelId);
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    profile: ProfileAdapter;
  }
}
