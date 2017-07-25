`import Ember from 'ember'`

PromptBoxComponent = Ember.Component.extend

  isActive: false
  classNames: ["modal"]
  classNameBindings: ["isActive:is-active"]
  layoutName: "components/prompt-box"

  actions:
    clearModal: ->
      @set "isActive", false

`export default PromptBoxComponent`
