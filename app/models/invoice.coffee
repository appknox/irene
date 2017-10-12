`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Invoice = DS.Model.extend
  invoiceId: DS.attr 'number'
  amount: DS.attr 'string'
  paidOn: DS.attr 'date'
  plan: DS.belongsTo 'plan', inverse:'invoices'

  paidOnHumanized: (->
    paidOn = @get "paidOn"
    paidOn.toLocaleDateString()
  ).property "paidOn"

`export default Invoice`
