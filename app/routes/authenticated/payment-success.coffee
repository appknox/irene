`import Ember from 'ember'`

AuthenticatedPaymentSuccessRoute = Ember.Route.extend
  ajax: Ember.inject.service()
  notify: Ember.inject.service()

  afterModel: ()->
    queryParams = location.href.split('?')[1]
    that = @
    @get("ajax").post "#{ENV.endpoints.chargebeeCallback}?#{queryParams}"
    .then (data)->
      that.get("notify").success "Payment Successful"
    .catch (error) ->
      that.get("notify").error "PAYMENT FAILED TO UPDATE!!!"
      for error in error.errors
        that.get("notify").error error.detail?.message

`export default AuthenticatedPaymentSuccessRoute`
