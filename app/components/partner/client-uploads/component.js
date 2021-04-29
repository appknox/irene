import Component from '@glimmer/component';
import {
  inject as service
} from '@ember/service';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  tracked
} from '@glimmer/tracking';
import {
  reads
} from '@ember/object/computed';
import {
  computed
} from '@ember/object';

export default class PartnerClientUploadsComponent extends PaginationMixin(Component) {

  @service store;

  @tracked targetModel = 'client-upload';

  @reads('objects') uploads;

  @computed('args.clientId')
  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId
    });
  }
}
