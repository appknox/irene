`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedBillingRoute = Ember.Route.extend ScrollTopMixin,

  title: "Billing"
  model: ->
    @modelFor("authenticated")

`export default AuthenticatedBillingRoute`
