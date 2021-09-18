import commondrf from './commondrf';

export default class Profile extends commondrf {
  async saveReportPreference(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/report_preference';
    await this.ajax(url, 'PUT', { data: data });
    return this.store.findRecord('profile', modelId);
  }
  async setShowPcidss(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowPcidss(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_pcidss';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
  async setShowHipaa(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowHipaa(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_hipaa';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
  async setShowAsvs(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_asvs';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowAsvs(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_asvs';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
  async setShowCwe(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_cwe';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowCwe(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_cwe';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
  async setShowMstg(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_mstg';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowMstg(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_mstg';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
  async setShowGdpr(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_gdpr';
    await this.ajax(url, 'PUT', { data });
    return this.store.findRecord('profile', modelId);
  }
  async unsetShowGdpr(modelInstance) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('profile', modelId) + '/show_gdpr';
    await this.ajax(url, 'DELETE');
    return this.store.findRecord('profile', modelId);
  }
}
