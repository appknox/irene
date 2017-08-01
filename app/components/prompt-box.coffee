`import Ember from 'ember'`

PromptBoxComponent = Ember.Component.extend

  isActive: false
  classNames: ["modal"]
  classNameBindings: ["isActive:is-active"]
  layoutName: "components/prompt-box"
  inputValue: ""
  delegate: null

  actions:

    clearModal: ->
      @set "isActive", false

    sendCallback: ->
      inputValue = @get "inputValue"
      delegate = @get "delegate"
      delegate.promptCallback(inputValue)

`export default PromptBoxComponent`
