/* eslint-disable ember/no-computed-properties-in-native-classes */
import Model, { attr } from '@ember-data/model';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import IntlService from 'ember-intl/services/intl';

export default class InvoiceModel extends Model {
  @service declare intl: IntlService;

  @attr('number')
  declare invoiceId: number;

  @attr('string')
  declare amount: string;

  @attr('date')
  declare paidOn: Date;

  @attr('string')
  declare planName: string;

  @attr('string')
  declare downloadUrl: string;

  @attr('boolean')
  declare isPaid: boolean;

  get tPending() {
    return this.intl.t('pending');
  }

  get tPaid() {
    return this.intl.t('paid');
  }

  get tUnpaid() {
    return this.intl.t('unpaid');
  }

  @computed('paidOn')
  get paidOnHumanized() {
    return this.paidOn.toLocaleDateString();
  }

  @computed('isPaid', 'paidOnHumanized', 'tPending')
  get paidDate() {
    if (this.isPaid) {
      return this.paidOnHumanized;
    }

    return this.tPending;
  }

  @computed('isPaid', 'tPaid', 'tUnpaid')
  get paidStatus() {
    if (this.isPaid) {
      return this.tPaid;
    }

    return this.tUnpaid;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    invoice: InvoiceModel;
  }
}
