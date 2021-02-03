import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';

import {
  tracked
} from '@glimmer/tracking';
import {
  computed
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

  @computed('args.client.id')
  get extraQueryStrings() {
    console.log('args', this.args)
    return JSON.stringify({
      clientId: this.args.client.id
    });
  }
}
