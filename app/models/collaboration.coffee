`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixins/base-model'`
`import ENUMS from 'irene/enums'`

Collaboration = DS.Model.extend BaseModelMixin,

  project : DS.belongsTo 'project', inverse: 'collaborations'
  user : DS.belongsTo 'user', inverse: 'collaboration'
  role : DS.attr 'number'

  roleHumanized:(->
    switch @get "role"
      when ENUMS.COLLABORATION_ROLE.ADMIN then "Admin"
      when ENUMS.COLLABORATION_ROLE.MANAGER then "Manager"
      when ENUMS.COLLABORATION_ROLE.READ_ONLY then "Read Only"
  ).property "role"

`export default Collaboration`
