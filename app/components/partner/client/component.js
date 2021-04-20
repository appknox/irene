import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';

import {
  tracked
} from '@glimmer/tracking';
import {
  computed,
  action
} from '@ember/object';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  reads
} from '@ember/object/computed';

export default class PartnerClientComponent extends PaginationMixin(Component) {

  @service store;

  @tracked targetModel = 'client-upload';

  @reads('objects') uploads;

  @tracked isShowCreditAllocationModal = false;

  @computed('args.client.id')
  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.client.id
    });
  }

  @action
  onShowCreditTransferModal() {
    this.isShowCreditAllocationModal = true;
  }

  @action
  onCloseModal() {
    this.isShowCreditAllocationModal = false;
    // Refresh model with new credit bal
    this.store.find('client', this.args.client.id)
  }
}
