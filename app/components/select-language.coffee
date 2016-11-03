`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

SelectLanguageComponent = Ember.Component.extend

  classNames: ["control"]

  i18n: Ember.inject.service()

  locales: Ember.computed 'i18n.locale', 'i18n.locales', ->
    i18n = @get 'i18n'
    @get('i18n.locales').map (loc) ->
      { id: loc, text: i18n.t('language.' + loc) }

  actions:
    setLocale: ->
      lang = @$('select').val()
      @set 'i18n.locale', lang
      data =
        lang: lang
      @get("ajax").post ENV.endpoints.lang, data: data

`export default SelectLanguageComponent`
