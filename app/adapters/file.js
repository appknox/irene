/* eslint-disable prettier/prettier, ember/no-get, ember/classic-decorator-no-classic-methods */
import commondrf from './commondrf';

export default class File extends commondrf {
  _buildURL(modelName, id) {
    if(id) {
      const baseurl = `${this.get('namespace_v2')}/files`;
      return this.buildURLFromBase(`${baseurl}/${encodeURIComponent(id)}`);
    }
  }
  _buildNestedURL(modelName, projectId) {
    const filesURL = `${this.get('namespace')}/projects/${projectId}/files`;
    return this.buildURLFromBase(filesURL);
  }
  urlForQuery(query, modelName) {
    return this._buildNestedURL(modelName, query.projectId);
  }
}
