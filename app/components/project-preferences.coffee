`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

devices = ENUMS.DEVICE_TYPE.CHOICES.reverse()[1..]

ProjectPreferencesComponent = Ember.Component.extend
  devices: devices
  currentDevice: devices[2].value
  project: null
  versions: ["Loading..."]

  didInsertElement: ->
    platformName = @get "project.platformIconClass"
    that = @
    @get("ajax").request ENV.endpoints.devices
    .then (data) ->
      that.set "versions", data
      debugger
    .catch (error) ->
      that.get("notify").error "failed"
      for error in error.errors
        that.get("notify").error error.detail?.message



    if platformName is "apple"

    else if platformName is "android"

    else
      alert(platformName)


  actions:
    deviceChanged: (value) ->
      @set "currentDevice", parseInt value

`export default ProjectPreferencesComponent`
