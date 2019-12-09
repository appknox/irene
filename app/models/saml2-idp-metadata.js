import DS from 'ember-data';
const { Model } = DS;

export default Model.extend({
  entityId: DS.attr('string'),
  ssoServiceUrl: DS.attr('string'),
  createdOn: DS.attr('date'),
  certificate: DS.attr(),

  deleteIdPMetadata(data) {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.deleteIdPMetadata(this, data);
  },
});
