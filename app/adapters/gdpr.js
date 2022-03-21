/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class GDPR extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/v2/gdprs`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
