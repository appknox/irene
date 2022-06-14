import commondrf from '../commondrf';

export default class PartnerclientFileAdapter extends commondrf {
  _buildNestedURL(_modelName, clientId, id) {
    const baseURL = `${this.namespace_v2}/partnerclients/${clientId}/files/${id}`;
    return this.buildURLFromBase(baseURL);
  }

  urlForQueryRecord(query, modelName) {
    return this._buildNestedURL(modelName, query.clientId, query.id);
  }

  urlForCreateReport(query, modelName) {
    const baseURL = this.urlForQueryRecord(query, modelName);
    return [baseURL, 'reports'].join('/');
  }

  createReport(snapshot, clientId, id, data) {
    const url = this.urlForCreateReport(
      {
        clientId,
        id,
      },
      snapshot.constructor.modelName
    );
    return this.ajax(url, 'POST', {
      data,
    });
  }
}
