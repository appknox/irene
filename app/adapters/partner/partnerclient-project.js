import commondrf from '../commondrf';

export default class PartnerclientProjectAdapter extends commondrf {
  buildURL(modelName, clientId) {
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${clientId}/projects`
    );
  }
}
