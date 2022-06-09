import Model, { attr } from '@ember-data/model';

export default class PartnerclientFileModel extends Model {
  @attr('string') name;
  @attr('date') createdOn;
  @attr('string') iconUrl;
  @attr('string') version;
  @attr('string') versionCode;

  async createReport(clientId, id, data) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.createReport(this, clientId, id, data);
  }
}
