`import Ember from 'ember'`
`import CONSTANTS from 'irene/utils/constants';`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

SubmitUrlComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  storeURL: ""
  tEnterValidURL: t("enterValidURL")
  tHangInThere: t("hangInThere")
  tNetworkError: t("networkError")
  actions:

    submitURL: ->
      tEnterValidURL = @get "tEnterValidURL"
      tHangInThere = @get "tHangInThere"
      tNetworkError = @get "tNetworkError"
      storeURL = @get("storeURL").trim()
      data = {storeURL: storeURL}
      if !CONSTANTS.WINDOWS_STORE_URL_RE.test(storeURL) and !CONSTANTS.ANDROID_STORE_URL_RE.test(storeURL)
        return @get("notify").error tEnterValidURL

      that = @
      ajax = @get "ajax"
      ajax.post(ENV.endpoints.storeUrl, {data: data})
      .then ->
        that.set "storeURL", null
        that.get("notify").success tHangInThere
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default SubmitUrlComponent`
