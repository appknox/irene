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
}

export default Organization;
