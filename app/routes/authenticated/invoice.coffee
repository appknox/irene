`import Ember from 'ember'`
`import config from 'irene/config/environment';`
`import ScrollTopMixin from 'irene/mixins/scroll-top'`

AuthenticatedInvoiceRoute = Ember.Route.extend ScrollTopMixin,

  title: "Invoice" + config.platform
  model: (params)->
    params

`export default AuthenticatedInvoiceRoute`
