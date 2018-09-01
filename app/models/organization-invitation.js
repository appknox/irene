import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  team: DS.belongsTo('organization-team'),
  organization: DS.belongsTo('organization'),

  resend: function resend() {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return adapter.resend(this.store, this.constructor.modelName, this);
  }
});
