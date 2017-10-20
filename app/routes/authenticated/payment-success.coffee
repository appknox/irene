`import Ember from 'ember'`
`import config from 'irene/config/environment';`

AuthenticatedPaymentSuccessRoute = Ember.Route.extend
  ajax: Ember.inject.service()
  notify: Ember.inject.service()

  beforeModel: ()->
    queryParams = location.href.split('?')[1]
    that = @
    @get("ajax").post "#{config.endpoints.chargebeeCallback}?#{queryParams}"
    .then (data)->
      that.get("notify").success "Payment Successful"
    .catch (error) ->
      that.get("notify").error "PAYMENT FAILED TO UPDATE!!!"
      for error in error.errors
        that.get("notify").error error.detail?.message
    return

`export default AuthenticatedPaymentSuccessRoute`
