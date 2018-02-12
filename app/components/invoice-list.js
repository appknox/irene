/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';

const InvoiceListComponent = Ember.Component.extend({

  classNames:["invoice-table"],

  invoices: (function() {
    return this.get("store").findAll("invoice");
  }).property(),


  hasInvoices: (function() {
    const invoices = this.get("invoices");
    return invoices.get("length") > 0;
  }).property("invoices.@each.id")
});

export default InvoiceListComponent;
