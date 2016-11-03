`import Ember from 'ember'`
`import CONSTANTS from 'irene/utils/constants';`
`import ENV from 'irene/config/environment'`

SubmitUrlComponent = Ember.Component.extend
  storeURL: ""

  actions:

    submitURL: ->
      storeURL = @get "storeURL"
      data = {storeURL: storeURL}
      if !CONSTANTS.WINDOWS_STORE_URL_RE.test(storeURL) and !CONSTANTS.ANDROID_STORE_URL_RE.test(storeURL)
        return @get("notify").error "Please enter a valid URL"

      that = @
      ajax = @get "ajax"
      ajax.post(ENV.endpoints.storeUrl, {data: data})
      .then ->
        that.set "storeURL", null
        that.get("notify").success "Hang in there while we process your URL"
      .catch (xhr, message, status) ->
        if xhr.status is 403
          that.get("notify").error xhr.responseJSON.message
        else
          that.get("notify").error "A network error occured! Please try again later"

`export default SubmitUrlComponent`
