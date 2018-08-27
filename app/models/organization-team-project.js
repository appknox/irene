import DS from 'ember-data';

export default DS.Model.extend({
  write: DS.attr('boolean'),

  async deleteProject(teamId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteProject(this.store, this.constructor.modelName, this, teamId);
  },
});
