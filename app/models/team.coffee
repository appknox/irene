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
    if membersCount in [0,1]
      return "#{membersCount} member"
    "#{membersCount} members"
  ).property "membersCount"

  teamMembers: (->
    members = @get "members"
    members.split ","
  ).property "members"


`export default Team`
