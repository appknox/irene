`import Ember from 'ember'`

AuthMfaComponent = Ember.Component.extend

  user: null
  showMFAIntro: true
  showBarCode: false

  actions:
    openMFAModal: ->
      @set "showMFAModal", true

    closeModal: ->
      @set "showMFAModal", false

    showBarCode: ->
      @set "showBarCode", true
      @set "showMFAIntro", false  


`export default AuthMfaComponent`
