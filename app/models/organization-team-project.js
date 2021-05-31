import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  write: attr('boolean'),

  async deleteProject(teamId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteProject(this.store, this.constructor.modelName, this, teamId);
  },

  async updateProject(teamId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.updateProject(this.store, this.constructor.modelName, this, teamId);
  },
});
