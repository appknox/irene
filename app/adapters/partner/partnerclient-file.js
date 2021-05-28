import commondrf from "../commondrf";

export default class PartnerclientFileAdapter extends commondrf {
  urlForQuery(q) {
    const clientId = q.clientId;
    q.clientId = undefined;
    return this.buildURLFromBase(
      `${this.namespace_v2}/partnerclients/${clientId}/files`
    );
  }
}
