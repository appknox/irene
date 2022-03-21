/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr }  from '@ember-data/model';

export default Model.extend({
  username: attr('string'),
  write: attr('boolean'),

  async deleteCollaborator(projectId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteCollaborator(this.store, this.constructor.modelName, this, projectId);
  },

  async updateCollaborator(projectId) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.updateCollaborator(this.store, this.constructor.modelName, this, projectId);
  },
});
