`import Ember from 'ember'`

InvoiceDetailsComponent = Ember.Component.extend

  invoice: (->
    invoiceId = @get "invoiceId"
    this.get('store').findRecord('invoice',invoiceId)
  ).property "invoiceId"

  discountAmount: (->
    price = @get "invoice.pricing.price"
    discount = @get "invoice.coupon.discount"
    price * discount/100
  ).property "invoice.pricing.price", "invoice.coupon.discount"
`export default InvoiceDetailsComponent`
