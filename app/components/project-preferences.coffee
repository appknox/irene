`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`

devices = ENUMS.DEVICE_TYPE.CHOICES.reverse()[1..]

ProjectPreferencesComponent = Ember.Component.extend
  devices: devices
  currentDevice: devices[2].value
  project: null


  didInsertElement: ->
    platformName = @get "project.platformIconClass"
    that = @
    versions: ["Loading..."]

    @get("ajax").request ENV.endpoints.devices
    .then (data) ->
      if platformName is "apple"
        that.set "versions", data.iOS
      else if platformName is "android"
        that.set "versions", data.Android
      else
        that.set "versions", ["NO DEVICE FOUND"]
    .catch (error) ->
      that.get("notify").error "failed"
      for error in error.errors
        that.get("notify").error error.detail?.message

  actions:
    deviceChanged: (value) ->
      @set "currentDevice", parseInt value

    versionSelected: ->
      alert("ehllo")

`export default ProjectPreferencesComponent`
