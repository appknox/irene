import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import Store from '@ember-data/store';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import InvoiceModel from 'irene/models/invoice';
// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import DS from 'ember-data';

type InvoicesResponse = DS.AdapterPopulatedRecordArray<InvoiceModel>;

export default class OrganizationBillingInvoiceListComponent extends Component {
  @service declare store: Store;

  @tracked invoices: InvoicesResponse | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchInvoices.perform();
  }

  fetchInvoices = task(async () => {
    this.invoices = (await this.store.findAll('invoice')) as InvoicesResponse;
  });

  get hasInvoices() {
    return (this.invoices?.toArray() || []).length > 0;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationBilling::InvoiceList': typeof OrganizationBillingInvoiceListComponent;
  }
}
