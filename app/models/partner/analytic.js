import Model, { attr } from '@ember-data/model';

export default class PartnerAnalyticModel extends Model {
  @attr() uploadTimeline;

  getDownloadURL() {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.getDownloadURL();
  }
}
