`import Ember from 'ember'`
`import CONSTANTS from 'irene/utils/constants';`
`import ENV from 'irene/config/environment'`
`import { translationMacro as t } from 'ember-i18n'`

SubmitUrlComponent = Ember.Component.extend
  i18n: Ember.inject.service()
  storeURL: ""
  enterValidURL: t("enterValidURL")
  hangInThere: t("hangInThere")
  networkError: t("networkError")
  actions:

    submitURL: ->
      enterValidURL = @get "enterValidURL"
      hangInThere = @get "hangInThere"
      networkError = @get "networkError"
      storeURL = @get "storeURL"
      data = {storeURL: storeURL}
      if !CONSTANTS.WINDOWS_STORE_URL_RE.test(storeURL) and !CONSTANTS.ANDROID_STORE_URL_RE.test(storeURL)
        return @get("notify").error enterValidURL

      that = @
      ajax = @get "ajax"
      ajax.post(ENV.endpoints.storeUrl, {data: data})
      .then ->
        that.set "storeURL", null
        that.get("notify").success hangInThere
      .catch (xhr, message, status) ->
        if xhr.status is 403
          that.get("notify").error xhr.responseJSON.message
        else
          that.get("notify").error networkError

`export default SubmitUrlComponent`
