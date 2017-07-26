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

    deleteTeam: ->
      teamName = @get "inputValue"
      delegate = @get "delegate"
      delegate.deleteTeam(teamName)

`export default PromptBoxComponent`
