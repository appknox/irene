/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class HIPAA extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/v2/hipaas`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
