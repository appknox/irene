`import Ember from 'ember'`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedInvoiceRoute = Ember.Route.extend ScrollTopMixin,

  title: "Invoice"
  model: (params)->
    params

`export default AuthenticatedInvoiceRoute`
