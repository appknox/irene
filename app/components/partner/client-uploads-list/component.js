import Component from '@glimmer/component';
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
import {
  inject as service
} from '@ember/service';

export default class PartnerClientUploadsListComponent extends PaginationMixin(Component) {

  @service store;

  @tracked targetModel = 'client-upload';

  @tracked isLoading = true;

  @reads('objects') uploads;

  @computed('args.clientId')
  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId
    });
  }
}
