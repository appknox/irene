`import Ember from 'ember'`
`import ENUMS from 'irene/enums';`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

ProjectPreferencesComponent = Ember.Component.extend

  project: null
  selectVersion: 0
  i18n: Ember.inject.service()
  store: Ember.inject.service()
  selectedDeviceType: ENUMS.DEVICE_TYPE.NO_PREFERENCE
  deviceTypes: ENUMS.DEVICE_TYPE.CHOICES[0...-1]

  tDeviceSelected: t("deviceSelected")
  tPleaseTryAgain: t("pleaseTryAgain")

  otherDevicesTypes: (->
    devices = []
    deviceType = @get "project.deviceType"
    otherDevicesTypes = @get("deviceTypes").slice()
    otherDevicesTypes.forEach (otherDevicesType) ->
      if otherDevicesType.value is deviceType
        return
      devices.push otherDevicesType
    devices
  ).property "deviceTypes","project.deviceType"

  devices: (->
    store = @get "store"
    store.findAll "device"
  ).property()

  availableDevices: Ember.computed.filter 'devices', (device) ->
    device.get("platform") is @get("project.platform")

  filteredDevices: Ember.computed "availableDevices", "selectedDeviceType", ->
    availableDevices = @get "availableDevices"
    selectedDeviceType = @get "selectedDeviceType"
    availableDevices.filter (device) ->
      switch selectedDeviceType
        when ENUMS.DEVICE_TYPE.NO_PREFERENCE
          true
        when ENUMS.DEVICE_TYPE.TABLET_REQUIRED
          device.get "isTablet"
        when ENUMS.DEVICE_TYPE.PHONE_REQUIRED
          !device.get "isTablet"

  otherDevices: (->
    osVersions = []
    filteredDevices = @get "filteredDevices"
    noPreference = {version: "0"}
    filteredDevices.push noPreference
    platformVersion = @get "project.platformVersion"
    otherDevices = @get("filteredDevices").slice()
    otherDevices.forEach (otherDevice) ->
      if otherDevice.version is platformVersion
        return
      osVersions.push otherDevice
    osVersions
  ).property "filteredDevices","project.platformVersion"

  uniqueDevices: Ember.computed.uniqBy "otherDevices", 'version'

  hasUniqueDevices: Ember.computed.gt 'uniqueDevices.length', 0

  devicesCount: Ember.computed.alias 'availableDevices.length'

  hasDevices: Ember.computed.gt 'devicesCount', 0

  actions:

    selectDeviceType: ->
      @set "selectedDeviceType", parseInt @$('#project-device-preference').val()

    selectVersion: ->
      @set "selectVersion", @$('#project-version-preference').val()

    versionSelected: ->

      selectVersion = @get "selectVersion"
      tDeviceSelected = @get "tDeviceSelected"
      tPleaseTryAgain = @get "tPleaseTryAgain"
      selectedDeviceType = @get "selectedDeviceType"

      projectId = @get "project.id"
      devicePreferences = [ENV.endpoints.devicePreferences, projectId].join '/'
      that = @
      data =
        deviceType: selectedDeviceType
        platformVersion: selectVersion
      @get("ajax").post devicePreferences, data: data
      .then (data) ->
        that.get("notify").success tDeviceSelected
      .catch (error) ->
        that.get("notify").error tPleaseTryAgain
        if Ember.isEmpty error?.errors
          return
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default ProjectPreferencesComponent`
