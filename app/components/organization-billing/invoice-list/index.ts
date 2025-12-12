import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type IntlService from 'ember-intl/services/intl';

// eslint-disable-next-line ember/use-ember-data-rfc-395-imports
import type DS from 'ember-data';
import type Store from 'ember-data/store';

import type InvoiceModel from 'irene/models/invoice';

type InvoicesResponse = DS.AdapterPopulatedRecordArray<InvoiceModel>;

export default class OrganizationBillingInvoiceListComponent extends Component {
  @service declare store: Store;
  @service declare intl: IntlService;

  @tracked invoices: InvoicesResponse | null = null;

  constructor(owner: unknown, args: object) {
    super(owner, args);

    this.fetchInvoices.perform();
  }

  get columns() {
    return [
      {
        name: this.intl.t('invoiceId'),
        valuePath: 'invoiceId',
        textAlign: 'center',
      },
      {
        name: this.intl.t('planName'),
        valuePath: 'planName',
        textAlign: 'center',
      },
      {
        name: this.intl.t('amountPaid'),
        valuePath: 'amount',
        textAlign: 'center',
      },
      {
        name: this.intl.t('date'),
        valuePath: 'paidDate',
        textAlign: 'center',
      },
      {
        name: this.intl.t('status'),
        valuePath: 'paidStatus',
        textAlign: 'center',
      },
      {
        name: this.intl.t('invoice'),
        component: 'organization-billing/invoice-list/download-action' as const,
        textAlign: 'center',
      },
    ];
  }

  get invoiceList() {
    return this.invoices?.slice() || [];
  }

  get hasInvoices() {
    return this.invoiceList.length > 0;
  }

  fetchInvoices = task(async () => {
    this.invoices = (await this.store.findAll('invoice')) as InvoicesResponse;
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationBilling::InvoiceList': typeof OrganizationBillingInvoiceListComponent;
  }
}
