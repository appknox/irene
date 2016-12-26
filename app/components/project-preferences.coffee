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

    if platformName is "apple"
      @get("ajax").request ENV.endpoints.devices
      .then (data) ->
        that.set "versions", data.iOS
      .catch (error) ->
        that.get("notify").error "failed"
        for error in error.errors
          that.get("notify").error error.detail?.message
    else if platformName is "android"
      @get("ajax").request ENV.endpoints.devices
      .then (data) ->
        that.set "versions", data.Android
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
