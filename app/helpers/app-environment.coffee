`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

# This function receives the params `params, hash`
appEnvironment = (params) ->

  currentAppEnv = parseInt params[0]

  if currentAppEnv is ENUMS.APP_ENV.NO_PREFERENCE
    "noPreference"
  else if currentAppEnv is ENUMS.APP_ENV.STAGING
    "staging"
  else if currentAppEnv is ENUMS.APP_ENV.PRODUCTION
    "production"
  else
    "noPreference"

AppEnvironmentHelper = Ember.Helper.helper appEnvironment

`export { appEnvironment }`

`export default AppEnvironmentHelper`
