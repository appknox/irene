import commondrf from '../commondrf';

export default class File extends commondrf {
  query(store, type, q) {
    let url = this.buildURLFromBase(`${this.get('namespace')}/projects/${q.projectId}/files?limit=${q.limit}&offset=${q.offset}`);
    return this.ajax(url, 'GET');
  }

  _buildURL(modelName, id) {
    if (id) {
      return this.buildURLFromBase(`${this.get('namespace')}/files/${id}`);
    }
  }
}
