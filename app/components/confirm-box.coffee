`import Ember from 'ember'`

ConfirmBoxComponent = Ember.Component.extend

  isActive: false
  classNames: ["modal"]
  classNameBindings: ["isActive:is-active"]
  layoutName: "components/confirm-box"
  delegate: null

  actions:

    clearModal: ->
      @set "isActive", false

    sendCallback: ->
      delegate = @get "delegate"
      delegate.confirmCallback()

`export default ConfirmBoxComponent`
