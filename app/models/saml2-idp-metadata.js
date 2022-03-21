/* eslint-disable ember/no-classic-classes */
import Model, { attr } from '@ember-data/model';

export default Model.extend({
  entityId: attr('string'),
  ssoServiceUrl: attr('string'),
  createdOn: attr('date'),
  certificate: attr(),

  deleteIdPMetadata(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.deleteIdPMetadata(this, data);
  },
});
