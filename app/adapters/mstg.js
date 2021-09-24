import commondrf from './commondrf';

export default class MSTG extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/v2/mstgs`;
    if (id) {
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
    return this.buildURLFromBase(baseurl);
  }
}
