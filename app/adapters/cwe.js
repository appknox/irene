/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class CWE extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/v2/cwes`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
