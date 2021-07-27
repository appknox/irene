import fetch from 'fetch';
import commondrf from './commondrf';

export default class FileReport extends commondrf {
  filesBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/files`);
  reportsBaseUrl = this.buildURLFromBase(`${this.namespace_v2}/reports`);

  _buildURL(modelName, fileId) {
    return `${this.filesBaseUrl}/${fileId}/reports`;
  }

  urlForQuery(q) {
    return `${this.filesBaseUrl}/${q.fileId}/reports`;
  }

  createRecord(store, modelClass, snapshot) {
    let url = this._buildURL(modelClass.modelName, snapshot.record.fileId);
    return this.ajax(url, 'POST', {
      data: {},
    });
  }

  urlForFindRecord(id) {
    return `${this.reportsBaseUrl}/${id}`;
  }

  async getReportByType(modelName, reportId, type) {
    const url = `${this.reportsBaseUrl}/${reportId}/${type}`;
    const response = await fetch(url, {
      headers: this.headers,
      method: 'GET',
    });
    return response.json();
  }
}
