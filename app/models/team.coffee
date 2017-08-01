`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`

Team = DS.Model.extend BaseModeMixin,

  uuid: DS.attr 'string'
  name: DS.attr 'string'
  members: DS.attr 'string'
  membersCount: DS.attr 'number'
  projectsCount: DS.attr 'number'
  owner: DS.belongsTo 'user', inverse: 'ownedTeams'
  users: DS.hasMany 'user', inverse: 'teams'
  collaborations: DS.hasMany 'collaboration', inverse:'team'

  isDefaultTeam: (->
    "Default" is @get "name"
  ).property "name"

  hasMembers: Ember.computed.gt 'membersCount', 1

  totalMembers: (->
    membersCount = @get "membersCount"
    if membersCount is 1
      return "#{membersCount} member"
    "#{membersCount} members"
  ).property "membersCount"

  totalProjects: (->
    projectsCount = @get "projectsCount"
    if projectsCount is 0
      return "no project"
    else if projectsCount is 1
      return "#{projectsCount} project"
    "#{projectsCount} projects"
  ).property "projectsCount"

  teamMembers: (->
    members = @get "members"
    members.split ","
  ).property "members"


`export default Team`
