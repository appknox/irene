import DS from 'ember-data';
import {
  computed
} from '@ember/object';
import {
  not
} from '@ember/object/computed';

const Organization = DS.Model.extend({
  name: DS.attr('string'),
  logo: DS.attr('string'),
  billingHidden: DS.attr('boolean'),
  showBilling: not('billingHidden'),
  isTrial: DS.attr('boolean'),
  mandatoryMfa: DS.attr('boolean'),
  members: DS.hasMany('organization-member'),
  namespaces: DS.hasMany('organization-namespace'),
  projects: DS.hasMany('organization-project'),
  teams: DS.hasMany('organization-team'),
  features: DS.attr(),
  projectsCount: DS.attr('number'),
  namespacesCount: DS.attr('number'),
  teamsCount: DS.attr('number'),
  membersCount: computed.reads('members.meta.count')
});

export default Organization;
