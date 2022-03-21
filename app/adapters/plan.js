/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class Plan extends commondrf {

  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/organizations/${this.get('organization').selected.id}/plans/`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
