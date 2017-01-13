`import Ember from 'ember'`

# This function receives the params `params, hash`
deviceType = (params) ->
  if !params
    return ''

  deviceType = params
  if deviceType = 0
    return "No Preference"
  else if deviceType = 1
    return "Phone Required"
  else
    return "Tablet Required"  

DeviceTypeHelper = Ember.Helper.helper deviceType

`export { deviceType }`

`export default DeviceTypeHelper`
