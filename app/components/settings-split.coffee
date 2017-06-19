`import Ember from 'ember'`

SettingsSplitComponent = Ember.Component.extend

  isGeneral: true
  isSecurity: false

  generalClass: Ember.computed "isGeneral", ->
    if @get "isGeneral"
      "is-active"

  securityClass: Ember.computed "isGeneral", ->
    if !@get "isGeneral"
      "is-active"

  actions:
    displayGeneral: ->
      @set "isGeneral", true

    displaySecurity: ->
      debugger
      @set "isGeneral", false

`export default SettingsSplitComponent`
