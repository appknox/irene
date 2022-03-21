/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr }  from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { t } from 'ember-intl';

const Invoice = Model.extend({
  intl: service(),
  invoiceId: attr('number'),
  amount: attr('string'),
  paidOn: attr('date'),
  planName: attr('string'),
  downloadUrl: attr('string'),
  isPaid: attr('boolean'),

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
