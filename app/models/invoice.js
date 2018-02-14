/*
 * DS102: Remove unnecessary code created because of implicit returns
 */
import DS from 'ember-data';
import ENUMS from 'irene/enums';
import { translationMacro as t } from 'ember-i18n';

const Invoice = DS.Model.extend({
  i18n: Ember.inject.service(),
  invoiceId: DS.attr('number'),
  amount: DS.attr('string'),
  paidOn: DS.attr('date'),
  planName: DS.attr('string'),
  downloadUrl: DS.attr('string'),
  isPaid: DS.attr('boolean'),

  tPending: t("pending"),
  tPaid: t("paid"),
  tUnpaid: t("unpaid"),

  paidOnHumanized: (function() {
    const paidOn = this.get("paidOn");
    return paidOn.toLocaleDateString();
  }).property("paidOn"),

  paidDate: (function() {
    const tPending = this.get("tPending");
    if (this.get("isPaid")) {
      return this.get("paidOnHumanized");
    }
    return tPending;
  }).property("paidOnHumanized", "isPaid"),

  paidStatus: (function() {
    const tPaid = this.get("tPaid");
    const tUnpaid = this.get("tUnpaid");
    if (this.get("isPaid")) {
      return tPaid;
    }
    return tUnpaid;
  }).property("isPaid")
});

export default Invoice;
