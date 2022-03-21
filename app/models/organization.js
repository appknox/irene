/* eslint-disable prettier/prettier, ember/no-classic-classes */
import Model, { attr, hasMany }  from '@ember-data/model';
import {
  computed
} from '@ember/object';
import {
  not
} from '@ember/object/computed';

const Organization = Model.extend({
  name: attr('string'),
  logo: attr('string'),
  billingHidden: attr('boolean'),
  showBilling: not('billingHidden'),
  isTrial: attr('boolean'),
  mandatoryMfa: attr('boolean'),
  members: hasMany('organization-member'),
  namespaces: hasMany('organization-namespace'),
  projects: hasMany('organization-project'),
  teams: hasMany('organization-team'),
  features: attr(),
  projectsCount: attr('number'),
  namespacesCount: attr('number'),
  teamsCount: attr('number'),
  membersCount: computed.reads('members.meta.count')
});

export default Organization;
