`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`
`import { translationMacro as t } from 'ember-i18n'`

Team = DS.Model.extend BaseModeMixin,

  i18n: Ember.inject.service()

  uuid: DS.attr 'string'
  name: DS.attr 'string'
  members: DS.attr 'string'
  membersCount: DS.attr 'number'
  projectsCount: DS.attr 'number'
  owner: DS.belongsTo 'user', inverse: 'ownedTeams'
  users: DS.hasMany 'user', inverse: 'teams'
  collaborations: DS.hasMany 'collaboration', inverse:'team'

  tMember: t("member")
  tMembers: t("members")
  tProject: t("project")
  tProjects: t("projects")

  isDefaultTeam: (->
    "Default" is @get "name"
  ).property "name"

  hasMembers: Ember.computed.notEmpty "members"

  totalMembers: (->
    tMember = @get "tMember"
    tMembers = @get("tMembers").string.toLowerCase()
    membersCount = @get "membersCount"
    if membersCount is 1
      return "#{membersCount} #{tMember}"
    "#{membersCount} #{tMembers}"
  ).property "membersCount"

  totalProjects: (->
    tProject = @get "tProject"
    tProjects = @get("tProjects").string.toLowerCase()
    projectsCount = @get "projectsCount"
    if projectsCount in [0,1]
      return "#{projectsCount} #{tProject}"
    "#{projectsCount} #{tProjects}"
  ).property "projectsCount"

  teamMembers: (->
    members = @get "members"
    members.split ","
  ).property "members"

`export default Team`
