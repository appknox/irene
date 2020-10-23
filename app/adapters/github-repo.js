import commondrf from './commondrf';

export default class GithubRepo extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/projects/${id}/github`;
    return this.buildURLFromBase(baseurl);
  }

  urlForCreateRecord(modelName, snapshot) {
    return this._buildURL(modelName, snapshot.id, snapshot);
  }
}
