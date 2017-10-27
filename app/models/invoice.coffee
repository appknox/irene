`import DS from 'ember-data'`
`import ENUMS from 'irene/enums'`
`import { translationMacro as t } from 'ember-i18n'`

Invoice = DS.Model.extend
  i18n: Ember.inject.service()
  invoiceId: DS.attr 'number'
  amount: DS.attr 'string'
  paidOn: DS.attr 'date'
  planName: DS.attr 'string'
  downloadUrl: DS.attr 'string'
  isPaid: DS.attr 'boolean'

  tPending: t("pending")
  tPaid: t("paid")
  tUnpaid: t("unpaid")

  paidOnHumanized: (->
    paidOn = @get "paidOn"
    paidOn.toLocaleDateString()
  ).property "paidOn"

  paidDate: (->
    tPending = @get "tPending"
    if @get "isPaid"
      return @get "paidOnHumanized"
    tPending
  ).property "paidOnHumanized", "isPaid"

  paidStatus: (->
    tPaid = @get "tPaid"
    tUnpaid = @get "tUnpaid"
    if @get "isPaid"
      return tPaid
    tUnpaid
  ).property "isPaid"

`export default Invoice`
