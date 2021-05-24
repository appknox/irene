import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject } from '@ember/service';
import { reads } from '@ember/object/computed';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerClientListComponent extends PaginationMixin(Component) {
  @inject intl;
  @inject store;

  @tracked clientList = [];
  @tracked isLoading = true;

  @reads('objects') clientList;

  targetModel = 'partnerclient';
  sortProperties = 'createdOn:desc';
}
