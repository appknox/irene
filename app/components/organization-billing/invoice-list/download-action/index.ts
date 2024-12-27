import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import ENV from 'irene/config/environment';
import type InvoiceModel from 'irene/models/invoice';
import type IreneAjaxService from 'irene/services/ajax';

interface OrganizationBillingInvoiceListDownloadActionSignature {
  Args: {
    invoice: InvoiceModel;
  };
}

type DownloadURLResponse = {
  url: string;
};

export default class OrganizationBillingInvoiceListDownloadActionComponent extends Component<OrganizationBillingInvoiceListDownloadActionSignature> {
  @service declare ajax: IreneAjaxService;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  getInvoiceLink = task({ drop: true }, async () => {
    const downloadUrl = this.args.invoice.downloadUrl;
    const url = new URL(downloadUrl, ENV.host).href;

    try {
      const result = await this.ajax.request<DownloadURLResponse>(url);

      if (!this.isDestroyed) {
        this.window.location.href = result.url;
      }
    } catch (error) {
      this.notify.error('Sorry something went wrong, please try again');
    }
  });
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'OrganizationBilling::InvoiceList::DownloadAction': typeof OrganizationBillingInvoiceListDownloadActionComponent;
    'organization-billing/invoice-list/download-action': typeof OrganizationBillingInvoiceListDownloadActionComponent;
  }
}
