`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

devices = ENUMS.DEVICE_TYPE.CHOICES.reverse()[1..]

ProjectPreferencesComponent = Ember.Component.extend
  devices: devices
  currentDevice: devices[2].value
  project: null
  versions: ["Loading..."]
  availableDevices: ["Loading..."]



  didInsertElement: ->
    platform = @get "project.platform"
    that = @
    @get("ajax").request ENV.endpoints.devices
    .then (data) ->
      if platform is ENUMS.PLATFORM.ANDROID
        versions = that.set "versions", data
        that.set "availableDevices", versions.devices.filterBy("platform", 0).filterBy("is_tablet",true)
        debugger

      else if platform is ENUMS.PLATFORM.IOS
        versions = that.set "versions", data
        that.set "availableDevices", versions.devices.filterBy("platform", 1).filterBy("is_tablet",true)
        debugger
      else
        versions = that.set "versions", data
        that.set "availableDevices", versions.devices.filterBy("platform", 1).filterBy("is_tablet",true)
        debugger
    .catch (error) ->
      that.get("notify").error "failed"
      if Ember.isEmpty error?.errors
        return
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:
    deviceChanged: (value) ->
      @set "currentDevice", parseInt value

    versionSelected: ->
      alert("ehllo")

`export default ProjectPreferencesComponent`
