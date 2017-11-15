`import DS from 'ember-data'`

Subscription = DS.Model.extend
  subscriptionId: DS.attr 'string'
  billingPeriod: DS.attr 'number'
  billingPeriodUnit: DS.attr 'string'
  planQuantity: DS.attr 'string'
  expiryDate: DS.attr 'date'
  status: DS.attr 'string'
  isActive: DS.attr 'boolean'
  isTrial: DS.attr 'boolean'
  isCancelled: DS.attr 'boolean'
  isPerScan: DS.attr 'boolean'
  planName: DS.attr 'string'

  expiryDateOnHumanized: (->
    expiryDate = @get "expiryDate"
    expiryDate.toLocaleDateString()
  ).property "expiryDate"

`export default Subscription`
