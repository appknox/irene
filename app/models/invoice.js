import DS from 'ember-data';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { t } from 'ember-intl';

const Invoice = DS.Model.extend({
  intl: service(),
  invoiceId: DS.attr('number'),
  amount: DS.attr('string'),
  paidOn: DS.attr('date'),
  planName: DS.attr('string'),
  downloadUrl: DS.attr('string'),
  isPaid: DS.attr('boolean'),

  tPending: t("pending"),
  tPaid: t("paid"),
  tUnpaid: t("unpaid"),

  paidOnHumanized: computed('paidOn', function() {
    const paidOn = this.get("paidOn");
    return paidOn.toLocaleDateString();
  }),

  paidDate: computed('isPaid', 'paidOnHumanized', 'tPending', function() {
    const tPending = this.get("tPending");
    if (this.get("isPaid")) {
      return this.get("paidOnHumanized");
    }
    return tPending;
  }),

  paidStatus: computed('isPaid', 'tPaid', 'tUnpaid', function() {
    const tPaid = this.get("tPaid");
    const tUnpaid = this.get("tUnpaid");
    if (this.get("isPaid")) {
      return tPaid;
    }
    return tUnpaid;
  })
});

export default Invoice;
