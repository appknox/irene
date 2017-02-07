`import Ember from 'ember'`

InvoiceListComponent = Ember.Component.extend

  invoices: (->
    @get("store").findAll "invoice"
  ).property()

`export default InvoiceListComponent`
