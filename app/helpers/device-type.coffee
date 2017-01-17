`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

# This function receives the params `params, hash`
deviceType = (params) ->

  currentDevice = params[0]

  if currentDevice is ENUMS.DEVICE_TYPE.NO_PREFERENCE
    "noPreference"
  else if currentDevice is ENUMS.DEVICE_TYPE.PHONE_REQUIRED
    "phone"
  else if currentDevice is ENUMS.DEVICE_TYPE.TABLET_REQUIRED
    "tablet"
  else
    "noPreference"

DeviceTypeHelper = Ember.Helper.helper deviceType

`export { deviceType }`

`export default DeviceTypeHelper`
