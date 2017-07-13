`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`

Team = DS.Model.extend BaseModeMixin,

  uuid: DS.attr 'string'
  name: DS.attr 'string'
  members: DS.attr 'string'
  membersCount: DS.attr 'number'
  owner: DS.belongsTo 'user', inverse: 'ownedTeams'
  users: DS.hasMany 'user', inverse: 'teams'
  collaborations: DS.hasMany 'collaboration', inverse:'team'

  canDeleteTeam: (->
    name = @get "name"
    if name is "Default"
      "disabled"
  ).property "name"

  hasMembers: Ember.computed.gt 'membersCount', 0

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
