/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class ProxySetting extends commondrf {

  buildURL(modelName, id) {
    return this.buildURLFromBase(`${this.get('namespace')}/profiles/${id}/proxy_settings`);
  }
}
