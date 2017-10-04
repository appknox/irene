`import Ember from 'ember'`

# This function receives the params `params, hash`
versionText = (params) ->

  currentVersion = params[0]

  if currentVersion is "0"
    "No Preference"
  else
    currentVersion

VersionTextHelper = Ember.Helper.helper versionText

`export { versionText }`

`export default VersionTextHelper`
