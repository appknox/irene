import Component from '@ember/component';
import { computed } from '@ember/object';

const InvoiceListComponent = Component.extend({

  classNames:["invoice-table"],

  invoices: computed(function() {
    return this.get("store").findAll("invoice");
  }),


  hasInvoices: computed("invoices.@each.id", function() {
    const invoices = this.get("invoices");
    return invoices.get("length") > 0;
  })
});

export default InvoiceListComponent;
