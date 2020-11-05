import commondrf from './commondrf';

export default class ProxySetting extends commondrf {

  buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.get('namespace')}/profiles/${id}/proxy_settings`);
  }
}
