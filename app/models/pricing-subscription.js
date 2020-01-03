import DS from 'ember-data';

export default DS.Model.extend({
  subscriptionId: DS.attr(),
  quantity: DS.attr('number'),
  plan: DS.belongsTo('pricing-plan'),
  currentPeriodEnd: DS.attr('date'),
  currentPeriodStart: DS.attr('date'),
  status: DS.attr('string')
});
