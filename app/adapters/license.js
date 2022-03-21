/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods, prettier/prettier */
import commondrf from './commondrf';

export default class License extends commondrf {
  _buildURL() {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/license`;
    return this.buildURLFromBase(baseurl);
  }
}
