`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`

Invoice = DS.Model.extend
  invoiceId: DS.attr 'number'
  amount: DS.attr 'string'
  paidOn: DS.attr 'date'
  planName: DS.attr 'string'
  downloadUrl: DS.attr 'string'

  paidOnHumanized: (->
    paidOn = @get "paidOn"
    paidOn.toLocaleDateString()
  ).property "paidOn"

`export default Invoice`
