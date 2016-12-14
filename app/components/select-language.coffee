`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

localeStrings =
  "en": "English"
  "ja": "日本語"

getLocaleString = (locale)->
  localeStrings[locale]

SelectLanguageComponent = Ember.Component.extend

  classNames: ["control"]

  i18n: Ember.inject.service()
  moment: Ember.inject.service()

  currentLocale: ( ->
    locale = @get "i18n.locale"
    localeString = getLocaleString locale
    locale: locale, localeString: localeString
  ).property "i18n.locale"

  otherLocales: ( ->
    locales = []
    locale = @get "i18n.locale"
    otherLocales = @get("i18n.locales").slice()
    otherLocales.removeObject locale
    for locale in otherLocales
      localeString = getLocaleString locale
      locales.push {locale: locale, localeString: localeString}
    locales
  ).property "i18n.locale"

  actions:
    setLocale: ->
      lang = @$('select').val()
      @set 'i18n.locale', lang
      @get('moment').changeLocale(lang)
      data =
        lang: lang
      @get("ajax").post ENV.endpoints.lang, data: data
      .then ->
        window.location.reload()

`export default SelectLanguageComponent`
