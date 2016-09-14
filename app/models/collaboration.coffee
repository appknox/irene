`import DS from 'ember-data'`
`import BaseModelMixin from 'irene/mixin/base-model'`
`import ENUMS from 'irene/enums'`

Collaboration = DS.Model.extend

  project : DS.belongsTo 'project', inverse: 'collaboration', async: false
  user : DS.belongsTo 'user', inverse: 'collaboration', async:false
  role : DS.attr 'number'

  roleHumanized:( ->
    switch @get "role"
      when ENUMS.COLLABORATION_ROLE.ADMIN then "Admin"
      when ENUMS.COLLABORATION_ROLE.MANAGER then "Manager"
      when ENUMS.COLLABORATION_ROLE,READ_ONLY then "Read Only"
  ).property "role"

`export default Collaboration`
