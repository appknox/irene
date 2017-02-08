`import Ember from 'ember'`

InvoiceListComponent = Ember.Component.extend

  classNames:["invoice-table"]

  invoices: (->
    @get("store").findAll "invoice"
  ).property()

`export default InvoiceListComponent`
