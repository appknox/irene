`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Collaboration = DS.Model.extend BaseModelMixin,

  project: DS.belongsTo 'project', inverse: 'collaborations'
  user: DS.belongsTo 'user', inverse: 'collaborations'
  team: DS.belongsTo 'team', inverse: 'collaborations'
  role: DS.attr 'number'
  username: DS.attr 'string'

  hasRole:(->
    role = @get "role"
    if role is ENUMS.COLLABORATION_ROLE.UNKNOWN
      return false
    return true
  ).property "role"

  roleHumanized:(->
    switch @get "role"
      when ENUMS.COLLABORATION_ROLE.ADMIN then "admin"
      when ENUMS.COLLABORATION_ROLE.MANAGER then "readWrite"
      when ENUMS.COLLABORATION_ROLE.READ_ONLY then "readOnly"
      else
        "noPreference"
  ).property "role"

`export default Collaboration`
