`import Ember from 'ember'`

AuthMfaComponent = Ember.Component.extend

  user: null
  showMFAIntro: true
  showBarCode: false

  didInsertElement: ->
    new QRious
      element: this.element.querySelector("canvas")
      background: 'white'
      backgroundAlpha: 0.8
      foreground: 'black'
      foregroundAlpha: 0.8
      level: 'H'
      padding: 25
      size: 350
      value: 'https://github.com/neocotic/qrious'


  actions:
    openMFAModal: ->
      @set "showMFAModal", true

    closeModal: ->
      @set "showMFAModal", false

    showBarCode: ->
      @set "showBarCode", true
      @set "showMFAIntro", false


`export default AuthMfaComponent`
