import commondrf from './commondrf';

export default class Organization extends commondrf {
  async saveReportPreference(modelInstance, data) {
    const modelId = modelInstance.get('id');
    const url = this.buildURL('organization', modelId) + '/report_preference';
    await this.ajax(url, 'PUT', { data: data });
    return this.store.findRecord('organization', modelId);
  }
}
