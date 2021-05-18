import commondrf from './commondrf';

export default class PartnerclientStatisticAdapter extends commondrf {
  buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.namespace_v2}/partnerclients/${id}/statistics`);
  }
}
