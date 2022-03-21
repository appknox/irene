/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class Mfa extends commondrf {
  _buildURL() {
    const baseURL = `${this.get('namespace')}/v2/mfa`;
    return this.buildURLFromBase(baseURL);
  }
}
