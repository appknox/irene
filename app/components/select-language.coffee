`import Ember from 'ember'`

SelectLanguageComponent = Ember.Component.extend
  i18n: Ember.inject.service()

  locales: Ember.computed 'i18n.locale', 'i18n.locales', ->
    i18n = @get 'i18n'
    @get('i18n.locales').map (loc) ->
      { id: loc, text: i18n.t('language.' + loc) }

  actions:
    setLocale: ->
      @set('i18n.locale', @$('select').val());

`export default SelectLanguageComponent`
