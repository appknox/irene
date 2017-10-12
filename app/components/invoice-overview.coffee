`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

InvoiceOverviewComponent = Ember.Component.extend

  invoice: null
  tagName:["tr"]

  actions:
    getInvoiceLink: ->
      invoiceId = @get "invoice.invoiceId"
      url = [ENV.endpoints.invoices, invoiceId, ENV.endpoints.signedInvoiceUrl].join '/'
      that = @
      @get("ajax").request url
      .then (result) ->
        window.open result.url
      .catch (error) ->
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default InvoiceOverviewComponent`
