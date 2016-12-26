`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`

devices = ENUMS.DEVICE_TYPE.CHOICES.reverse()[1..]


ProjectPreferencesComponent = Ember.Component.extend
  devices: devices
  currentDevice: devices[2].value

  actions:
    deviceChanged: (value) ->
      @set "currentDevice", parseInt value

`export default ProjectPreferencesComponent`
