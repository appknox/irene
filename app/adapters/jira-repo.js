import commondrf from './commondrf';

export default class JiraRepo extends commondrf {
  _buildURL(modelName, id) {
    const baseurl = `${this.get('namespace')}/projects/${id}/jira`;
    return this.buildURLFromBase(baseurl);
  }

  urlForCreateRecord(modelName, snapshot) {
    return this._buildURL(modelName, snapshot.id, snapshot);
  }
}
