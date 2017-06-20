`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

AuthMfaComponent = Ember.Component.extend

  user: null
  showMFAIntro: true
  showBarCode: false
  enableMFAOTP: null
  disableMFAOTP: null

  didInsertElement: ->
    new QRious
      element: this.element.querySelector("canvas")
      background: 'white'
      backgroundAlpha: 0.8
      foreground: 'black'
      foregroundAlpha: 0.8
      level: 'H'
      padding: 25
      size: 300
      value: 'https://github.com/neocotic/qrious'


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
      enableMFAOTP = @get "enableMFAOTP"
      that = @
      data =
        otp: enableMFAOTP
      @get("ajax").post ENV.endpoints.enableMFA, data: data
      .then (data)->
        that.get("notify").success "success"
        that.set "enableMFAOTP", ""
        that.set "showMFAEnableModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message

    disableMFA: ->
      disableMFAOTP = @get "disableMFAOTP"
      that = @
      data =
        otp: disableMFAOTP
      @get("ajax").post ENV.endpoints.disableMFA, data: data
      .then (data)->
        that.get("notify").success "success"
        that.set "disableMFAOTP", ""
        that.set "showMFADisableModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default AuthMfaComponent`
