/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods, prettier/prettier */
import commondrf from './commondrf';

export default class Invoice extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/invoices`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
