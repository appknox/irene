deviceSelection = (deviceType,versions,currentDevice,platformType,platform) ->
  if platform is platformType.ANDROID
    if currentDevice is deviceType.PHONE_REQUIRED
      versions.devices.filterBy("platform", 0).filterBy("is_tablet",false)
    else if currentDevice is deviceType.TABLET_REQUIRED
      versions.devices.filterBy("platform", 0).filterBy("is_tablet",true)
    else
      versions.devices.filterBy("platform", 0)
  else if platform is platformType.IOS
    if currentDevice is deviceType.PHONE_REQUIRED
      versions.devices.filterBy("platform", 1).filterBy("is_tablet",false)
    else if currentDevice is deviceType.TABLET_REQUIRED
      versions.devices.filterBy("platform", 1).filterBy("is_tablet",true)
    else
      versions.devices.filterBy("platform", 1)
  else
    if currentDevice is deviceType.PHONE_REQUIRED
      versions.devices.filterBy("platform", 1).filterBy("is_tablet",false)
    else if currentDevice is deviceType.TABLET_REQUIRED
      versions.devices.filterBy("platform", 1).filterBy("is_tablet",true)
    else
      versions.devices.filterBy("platform", 1)

`export default deviceSelection`
