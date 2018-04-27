import DS from 'ember-data';
import Ember from 'ember';
import BaseModeMixin from 'irene/mixins/base-model';
import { translationMacro as t } from 'ember-i18n';

const OrganizationTeam = DS.Model.extend(BaseModeMixin, {

  i18n: Ember.inject.service(),

  uuid: DS.attr('string'),
  name: DS.attr('string'),
  membersCount: DS.attr('number'),
  projectsCount: DS.attr('number'),
  owner: DS.attr('string'),
  users: DS.hasMany('user', {inverse: 'teams'}),
  collaborations: DS.hasMany('collaboration', {inverse:'team'}),
  organization: DS.belongsTo('organization', {inverse: 'organizationTeams'}),

  tMember: t("member"),
  tMembers: t("members"),
  tProject: t("project"),
  tProjects: t("projects"),

  isDefaultTeam: (function() {
    return "Default" === this.get("name");
  }).property("name"),

  totalMembers: (function() {
    const tMember = this.get("tMember");
    const tMembers = this.get("tMembers").string.toLowerCase();
    const membersCount = this.get("membersCount");
    if (membersCount === 1) {
      return `${membersCount} ${tMember}`;
    }
    return `${membersCount} ${tMembers}`;
  }).property("membersCount"),

  totalProjects: (function() {
    const tProject = this.get("tProject");
    const tProjects = this.get("tProjects").string.toLowerCase();
    const projectsCount = this.get("projectsCount");
    if ([0,1].includes(projectsCount)) {
      return `${projectsCount} ${tProject}`;
    }
    return `${projectsCount} ${tProjects}`;
  }).property("projectsCount")
}
);

export default OrganizationTeam;
