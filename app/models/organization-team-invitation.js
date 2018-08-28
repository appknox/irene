import DS from 'ember-data';

export default DS.Model.extend({
  email: DS.attr('string'),
  createdOn: DS.attr('date'),
  updatedOn: DS.attr('date'),
  organization: DS.belongsTo('organization'),

  async createInvitation(teamId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.createInvitation(this.store, this.constructor.modelName, this, teamId);
  },
});
