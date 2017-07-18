`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

# This function receives the params `params, hash`
roleHumanized = (params) ->

  currentRole = params[0]

  if currentRole is ENUMS.COLLABORATION_ROLE.ADMIN
    "admin"
  else if currentRole is ENUMS.COLLABORATION_ROLE.MANAGER
    "readWrite"
  else if currentRole is ENUMS.COLLABORATION_ROLE.READ_ONLY
    "readOnly"
  else
    "changeRole"

RoleHumanizedHelper = Ember.Helper.helper roleHumanized

`export { roleHumanized }`

`export default RoleHumanizedHelper`
