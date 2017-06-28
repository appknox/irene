`import DS from 'ember-data'`
`import BaseModeMixin from 'irene/mixins/base-model'`

Team = DS.Model.extend BaseModeMixin,

  uuid: DS.attr 'string'
  name: DS.attr 'string'
  owner: DS.belongsTo 'user', inverse: 'teams'
  users: DS.hasMany 'user', inverse: 'teams'
  collaborations: DS.hasMany 'collaboration', inverse:'team'

  totalMembers: (->
    totalMembers = 0
    users = @get "users"
    users.forEach (user)->
      totalMembers = totalMembers + 1
    return totalMembers
  ).property "users"

`export default Team`
