import commondrf from './commondrf';

export default class Analysis extends commondrf {
  _buildURL(modelName, id) {
    if(id) {
      const baseurl = `${this.get('namespace_v2')}/analyses`;
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }
  _buildNestedURL(modelName, fileId) {
    const baseURL = `${this.get('namespace_v2')}/files/${fileId}/analyses`;
    return this.buildURLFromBase(baseURL);
  }
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.fileId);
  }
}
