`import Ember from 'ember'`

ConfirmBoxComponent = Ember.Component.extend

  isActive: false
  classNames: ["modal"]
  classNameBindings: ["isActive:is-active"]
  layoutName: "components/confirm-box"
  inputValue: ""
  delegate: null

  actions:

    clearModal: ->
      @set "isActive", false

    sendCallback: ->
      inputValue = @get "inputValue"
      delegate = @get "delegate"
      delegate.confirmCallback(inputValue)

`export default ConfirmBoxComponent`
