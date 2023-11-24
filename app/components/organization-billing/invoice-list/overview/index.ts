import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ENV from 'irene/config/environment';
import InvoiceModel from 'irene/models/invoice';
import { task } from 'ember-concurrency';

interface OrganizationBillingInvoiceListOverviewSignature {
  Args: {
    invoice: InvoiceModel;
  };
}

export default class OrganizationBillingInvoiceListOverviewComponent extends Component<OrganizationBillingInvoiceListOverviewSignature> {
  @service declare ajax: any;
  @service('browser/window') declare window: Window;
  @service('notifications') declare notify: NotificationService;

  getInvoiceLink = task({ drop: true }, async () => {
    const downloadUrl = this.args.invoice.downloadUrl;
    const url = new URL(downloadUrl, ENV.host).href;

    try {
      const result = await this.ajax.request(url);

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
    'OrganizationBilling::InvoiceList::Overview': typeof OrganizationBillingInvoiceListOverviewComponent;
  }
}
