import Component from '@glimmer/component';

import {
  tracked
} from '@glimmer/tracking';

import {
  inject as service
} from '@ember/service';
import {
  PaginationMixin
} from '../../../mixins/paginate';
import {
  reads
} from '@ember/object/computed';
import {
  computed
} from '@ember/object';

export default class PartnerClientListComponent extends PaginationMixin(Component) {

  // Dependencies
  @service store;

  // Properties
  // @reads('args.targetModel') targetModel;
  @computed('args.model')
  get targetModel() {
    return this.args.model;
  }

  @tracked clientList = [];

  @reads('objects') clientList;

  // @task(function* () {
  //   this.clientList = [yield this.store.queryRecord('client', {
  //     p: 1
  //   })];
  //   console.log('this.clientList', this.clientList)
  // })
  // fetchClients;

}
