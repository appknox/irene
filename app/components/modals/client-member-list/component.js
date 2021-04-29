import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  inject as service
} from '@ember/service';
import {
  computed
} from '@ember/object';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  reads
} from '@ember/object/computed';

export default class ModalsClientMemberList extends PaginationMixin(Component) {

  @service store;

  @tracked targetModel = 'client-member';

  @reads('objects') members;

  @computed('args.clientId')
  get extraQueryStrings() {
    return JSON.stringify({
      clientId: this.args.clientId
    });
  }
}
