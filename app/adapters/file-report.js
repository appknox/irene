import ENV from 'irene/config/environment';
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

  urlForCreateRecord(modelName, snapshot) {
    return `${this.filesBaseUrl}/${snapshot.record.fileId}/reports`;
  }

  urlForFindRecord(id) {
    return `${this.reportsBaseUrl}/${id}`;
  }

  async getReportByType(modelName, reportId, type) {
    const url = `${this.reportsBaseUrl}/${reportId}/${type}`;
    const response = await fetch(url, {
      headers: this.headers,
      method: 'GET'
    });
    return response.json();
  }

  async reGenerateReport(modelName, fileId, data = {}) {
    const url = `${this.get('host')}/${this.hudsonNamespace}/${ENV.endpoints.reports}/${fileId}`;
    const response = await fetch(url, {
      headers: Object.assign(this.headers, {
        'Content-Type': 'application/json'
      }),
      method: 'PUT',
      body: JSON.stringify(data),
      contentType: 'application/json'
    });
    return response.json();
  }

  async downloadExternalReport(model, fileId) {
    const url = `${this.get('host')}/${this.hudsonNamespace}/${ENV.endpoints.reports}/${fileId}/download_url`;
    const response = await fetch(url, {
      headers: this.headers,
      method: 'GET'
    });
    return response.json();
  }

}
