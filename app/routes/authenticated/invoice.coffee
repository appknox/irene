`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`
`import RouteTitleMixin from 'irene/mixins/route-title'`

AuthenticatedInvoiceRoute = Ember.Route.extend ScrollTopMixin, RouteTitleMixin

  subtitle: "Invoice"
  model: (params)->
    params

`export default AuthenticatedInvoiceRoute`
