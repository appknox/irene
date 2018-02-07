`import Ember from 'ember'`
`import ENUMS from 'irene/enums'`

# This function receives the params `params, hash`
appAction = (params) ->

  currentAppAction = parseInt params[0]

  if currentAppAction is ENUMS.APP_ACTION.NO_PREFERENCE
    "noPreference"
  else if currentAppAction is ENUMS.APP_ACTION.HALT
    "halt"
  else if currentAppAction is ENUMS.APP_ACTION.PROCEED
    "proceed"
  else
    "noPreference"

AppActionHelper = Ember.Helper.helper appAction

`export { appAction }`

`export default AppActionHelper`
