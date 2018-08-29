import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  members: DS.hasMany('organization-team-member'),
  organization: DS.attr('string'),
  createdOn: DS.attr('date'),
  membersCount: DS.attr('number'),
  projectsCount: DS.attr('number'),

  async deleteMember(member) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    await adapter.deleteMember(this.store, this.constructor.modelName, this, member);
    // TODO: fix this to do after showing notification
    this.get('members').removeObject(member);
    await this.get('members').reload();
    await this.get('store').unloadRecord(member);
  },

  async addProject(data, id) {
    var adapter = this.store.adapterFor(this.constructor.modelName);
    return await adapter.addProject(this.store, this.constructor.modelName, this, data, id);
  },
});
