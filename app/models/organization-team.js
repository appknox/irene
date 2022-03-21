/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr, hasMany }  from '@ember-data/model';

export default Model.extend({
  name: attr('string'),
  members: hasMany('organization-team-member'),
  organization: attr('string'),
  createdOn: attr('date'),
  membersCount: attr('number'),
  projectsCount: attr('number'),

  async deleteMember(member) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteMember(this.store, this.constructor.modelName, this, member);
    // TODO: fix this to do after showing notification
    this.get('members').removeObject(member);
    await this.get('members').reload();
    await this.get('store').unloadRecord(member);
  },

  async addMember(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.addMember(this.store, this.constructor.modelName, this, data, id);
  },

  async addProject(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.addProject(this.store, this.constructor.modelName, this, data, id);
  },

  async createInvitation(data) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.createInvitation(this.store, this.constructor.modelName, this, data);
  },
});
