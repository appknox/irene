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

export default class PartnerClientListComponent extends PaginationMixin(Component) {


  // Dependencies
  @service store;

  // Properties
  targetModel = 'client';

  @tracked clientList = [];

  @tracked isLoading = true;

  @reads('objects') clientList;
}
