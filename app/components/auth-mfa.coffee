`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`
`import { translationMacro as t } from 'ember-i18n'`

isValidOTP = (otp)->
  return otp.length > 5

AuthMfaComponent = Ember.Component.extend

  i18n: Ember.inject.service()
  user: null
  showMFAIntro: true
  showBarCode: false
  enableMFAOTP: null
  disableMFAOTP: null

  tEnterOTP: t("enterOTP")
  tMFAEnabled: t("mfaEnabled")
  tMFADisabled: t("mfaDisabled")

  didInsertElement: ->
    provisioningURL = @get "user.provisioningURL"
    new QRious
      element: this.element.querySelector("canvas")
      background: 'white'
      backgroundAlpha: 0.8
      foreground: 'black'
      foregroundAlpha: 0.8
      level: 'H'
      padding: 25
      size: 300
      value: provisioningURL


  actions:
    openMFAEnableModal: ->
      @set "showMFAEnableModal", true
      @set "showMFAIntro", true
      @set "showBarCode", false

    openMFADisableModal: ->
      @set "showMFADisableModal", true

    closeMFAEnableModal: ->
      @set "showMFAEnableModal", false

    closeMFADisableModal: ->
      @set "showMFADisableModal", false

    showBarCode: ->
      @set "showBarCode", true
      @set "showMFAIntro", false

    enableMFA: ->
      tEnterOTP = @get "tEnterOTP"
      tMFAEnabled = @get "tMFAEnabled"
      enableMFAOTP = @get "enableMFAOTP"
      that = @
      for otp in [enableMFAOTP]
        return @get("notify").error tEnterOTP if !isValidOTP otp
      data =
        otp: enableMFAOTP
      @get("ajax").post ENV.endpoints.enableMFA, data: data
      .then (data)->
        that.get("notify").success tMFAEnabled
        that.set "enableMFAOTP", ""
        that.set "showMFAEnableModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    disableMFA: ->
      tEnterOTP = @get "tEnterOTP"
      tMFADisabled = @get "tMFADisabled"
      disableMFAOTP = @get "disableMFAOTP"
      that = @
      for otp in [disableMFAOTP]
        return @get("notify").error tEnterOTP if !isValidOTP otp
      data =
        otp: disableMFAOTP
      @get("ajax").post ENV.endpoints.disableMFA, data: data
      .then (data)->
        that.get("notify").success tMFADisabled
        that.set "disableMFAOTP", ""
        that.set "showMFADisableModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default AuthMfaComponent`
