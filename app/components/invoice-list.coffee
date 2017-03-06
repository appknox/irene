`import Ember from 'ember'`

InvoiceListComponent = Ember.Component.extend

  classNames:["invoice-table"]

  invoices: (->
    @get("store").findAll "invoice"
  ).property()


  hasInvoices: (->
    invoices = @get "invoices"
    invoices.get("length") > 0
  ).property "invoices.@each.id"

`export default InvoiceListComponent`
