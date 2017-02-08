`import Ember from 'ember'`

InvoiceDetailsComponent = Ember.Component.extend

  invoice: (->
    invoiceId = @get "invoiceId"
    this.get('store').findRecord('invoice',invoiceId)
  ).property "invoiceId"

`export default InvoiceDetailsComponent`
