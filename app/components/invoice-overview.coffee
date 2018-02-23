`import Ember from 'ember'`
`import ENV from 'irene/config/environment';`

InvoiceOverviewComponent = Ember.Component.extend

  invoice: null
  tagName:["tr"]

  isDownloadingInvoice: false

  actions:
    getInvoiceLink: ->
      invoiceId = @get "invoice.invoiceId"
      url = [ENV.endpoints.invoices, invoiceId, ENV.endpoints.signedInvoiceUrl].join '/'
      that = @
      @set "isDownloadingInvoice", true
      @get("ajax").request url
      .then (result) ->
        window.open result.data.url
        that.set "isDownloadingInvoice", false
      .catch (error) ->
        that.set "isDownloadingInvoice", false
        for error in error.errors
          that.get("notify").error error.detail?.message

`export default InvoiceOverviewComponent`
