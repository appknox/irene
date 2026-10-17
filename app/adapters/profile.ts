import commondrf from './commondrf';

import type ProfileModel from 'irene/models/profile';
import {
  type ProfileRegulatoryReportPreference,
  type SaveReportPreferenceData,
  type SaveKnoxIqAutomatedTriggerData,
  type SetProfileRegulatorPrefData,
} from 'irene/models/profile';
import type {
  ProfileSlaPolicy,
  ProfileSlaWindow,
  VulnerabilitySlaSeverity,
  VulnerabilitySlaWindow,
} from 'irene/utils/vulnerability-sla';

export default class ProfileAdapter extends commondrf {
  _buildURL(_: string, id: string | number, namespace = this.namespace) {
    const baseurl = `${namespace}/profiles`;

    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }

    return this.buildURLFromBase(baseurl);
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

  async saveKnoxIqAutomatedTrigger(
    modelInstance: ProfileModel,
    data: SaveKnoxIqAutomatedTriggerData
  ) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/knoxiq_automated_trigger';

    await this.ajax(url, 'PUT', { data });

    return this.store.findRecord('profile', modelId);
  }

  slaPolicyURL(modelInstance: ProfileModel) {
    return this.buildURL('profile', modelInstance.get('id')) + '/sla_policy';
  }

  getSlaPolicy(modelInstance: ProfileModel): Promise<ProfileSlaPolicy> {
    return this.ajax(this.slaPolicyURL(modelInstance), 'GET');
  }

  setSlaPolicySeverity(
    modelInstance: ProfileModel,
    severity: VulnerabilitySlaSeverity,
    data: VulnerabilitySlaWindow
  ): Promise<ProfileSlaWindow> {
    const url = `${this.slaPolicyURL(modelInstance)}/${severity}`;

    return this.ajax(url, 'PUT', { data });
  }

  resetSlaPolicySeverity(
    modelInstance: ProfileModel,
    severity: VulnerabilitySlaSeverity
  ): Promise<ProfileSlaWindow> {
    const url = `${this.slaPolicyURL(modelInstance)}/${severity}`;

    return this.ajax(url, 'DELETE');
  }
}

declare module 'ember-data/types/registries/adapter' {
  export default interface AdapterRegistry {
    profile: ProfileAdapter;
  }
}
