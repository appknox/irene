`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`

Team = DS.Model.extend BaseModeMixin,

  uuid: DS.attr 'string'
  name: DS.attr 'string'
  owner: DS.belongsTo 'user', inverse: 'ownedTeams'
  users: DS.hasMany 'user', inverse: 'teams'
  collaborations: DS.hasMany 'collaboration', inverse:'team'

  totalMembers: (->
    totalMembers = @get "users.length"
    if totalMembers is 1
      return "#{totalMembers} member"
    "#{totalMembers} members"
  ).property "users"

`export default Team`
