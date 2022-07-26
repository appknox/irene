import Model, { attr, hasMany } from '@ember-data/model';

class Organization extends Model {
  @attr('string') name;
  @attr('string') logo;
  @attr('boolean') billingHidden;
  @attr('boolean') isTrial;
  @attr('boolean') mandatoryMfa;
  @hasMany('organization-member') members;
  @hasMany('organization-namespace') namespaces;
  @hasMany('organization-project') projects;
  @hasMany('organization-team') teams;
  @attr() features;
  @attr('number') projectsCount;
  @attr('number') namespacesCount;
  @attr('number') teamsCount;

  get showBilling() {
    return !this.billingHidden;
  }

  get membersCount() {
    return this.members?.meta?.count;
  }

  async get_am_configuration() {
    const adapter = this.store.adapterFor('amconfiguration');
    const payload = await adapter.from_organization(this.id);

    const normalized = this.store.normalize('amconfiguration', payload);
    return this.store.push(normalized);
  }
}

export default Organization;
