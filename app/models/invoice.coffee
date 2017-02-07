`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Invoice = DS.Model.extend
  user : DS.belongsTo 'user', inverse: 'invoices'
  amount: DS.attr 'string'
  paidOn: DS.attr 'date'
  source: DS.attr 'number'
  pricing: DS.belongsTo 'pricing', inverse:'invoices'

  sourceType: (->
    switch @get "source"
      when ENUMS.PAYMENT_SOURCE.PAYPAL then "paypal"
      when ENUMS.PAYMENT_SOURCE.STRIPE_MANUAL then "stripeManual"
      when ENUMS.PAYMENT_SOURCE.BANK_TRANSFER then "bankTransfer"
      when ENUMS.PAYMENT_SOURCE.MANUAL then "manual"
      when ENUMS.PAYMENT_SOURCE.STRIPE_RECURRING then "stripeRecurring"
      else "unknown"
  ).property "source"

  paidOnHumanized: (->
    paidOn = @get "paidOn"
    paidOn.toLocaleDateString()
  ).property "paidOn"

`export default Invoice`
