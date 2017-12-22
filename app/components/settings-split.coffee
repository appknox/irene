`import Ember from 'ember'`

SettingsSplitComponent = Ember.Component.extend

  isGeneral: true
  isSecurity: false
  isDeveloperSettings: false

  generalClass: Ember.computed 'isGeneral', ->
    if @get 'isGeneral'
      'is-active'

  securityClass: Ember.computed 'isSecurity', ->
    if @get 'isSecurity'
      'is-active'


  developerSettingsClass: Ember.computed 'isDeveloperSettings', ->
    if @get 'isDeveloperSettings'
      'is-active'

  actions:
    displayGeneral: ->
      @set 'isGeneral', true
      @set 'isSecurity', false
      @set 'isDeveloperSettings', false

    displaySecurity: ->
      @set 'isGeneral', false
      @set 'isSecurity', true
      @set 'isDeveloperSettings', false

    displayDeveloperSettings: ->
      @set 'isGeneral', false
      @set 'isSecurity', false
      @set 'isDeveloperSettings', true

`export default SettingsSplitComponent`
