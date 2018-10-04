import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  write: DS.attr('boolean'),

  async deleteCollaborator(projectId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteCollaborator(this.store, this.constructor.modelName, this, projectId);
  },

  async updateCollaborator(projectId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.updateCollaborator(this.store, this.constructor.modelName, this, projectId);
  },
});
