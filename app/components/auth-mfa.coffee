`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

AuthMfaComponent = Ember.Component.extend

  user: null
  showMFAIntro: true
  showBarCode: false
  generatedOtp: null

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
      generatedOtp = @get "generatedOtp"
      that = @
      data =
        otp: generatedOtp
      debugger
      @get("ajax").post ENV.endpoints.enableMFA, data: data
      .then (data)->
        that.get("notify").success "success"
        that.set "generatedOtp", ""
        that.set "showMFAEnableModal", false
      .catch (error) ->
        that.get("notify").error error.payload.message
        for error in error.errors
          that.get("notify").error error.detail?.message


`export default AuthMfaComponent`
