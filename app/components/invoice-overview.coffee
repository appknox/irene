`import Ember from 'ember'`

InvoiceOverviewComponent = Ember.Component.extend

  invoice: null
  tagName:["tr"]

  actions:
    viewInvoice: ->
      window.open(@get "invoice.downloadUrl", '_blank');

`export default InvoiceOverviewComponent`
