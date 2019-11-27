import DS from 'ember-data';
const { Model } = DS;

export default Model.extend({
  entityId: DS.attr('string'),
  ssoServiceUrl: DS.attr('string'),
  createdOn: DS.attr('date'),
  certificate: DS.attr(),
});
