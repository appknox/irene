import commondrf from '../commondrf';

export default class PartnerclientProjectAdapter extends commondrf {
  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${clientId}/projects`
    );
  }

  // buildURL(modelName, id, snapshot, requestType, query) {
  //   console.log('params', modelName, id, snapshot, requestType, query);
  //   const clientId = query.clientId;
  //   const projectId = query.projectId;
  //   query.clientId = undefined;
  //   query.projectId = undefined;
  //   return this.buildURLFromBase(
  //     `${this.namespace_v2}/partnerclients/${clientId}/projects${
  //       projectId ? '/' + projectId : ''
  //     }`
  //   );
  // }
}
