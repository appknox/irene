`import Ember from 'ember'`

SEPERATOR = "-"
# This function receives the params `params, hash`
filterPlatform = (params) ->
  sortingKeyObject = params[0]
  "#{sortingKeyObject.key}#{SEPERATOR}#{sortingKeyObject.reverse}"

filterPlatformValues = (value) ->
  [key, reverse] = value.split(SEPERATOR)
  if reverse is "true"
    reverse = true
  else
    reverse = false
  [key, reverse]

FilterPlatformHelper = Ember.Helper.helper filterPlatform

`export { filterPlatform, filterPlatformValues }`

`export default FilterPlatformHelper`
