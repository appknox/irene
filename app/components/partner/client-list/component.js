import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { PaginationMixin } from '../../../mixins/paginate';

export default class PartnerClientListComponent extends PaginationMixin(Component) {
  @service intl;
  @service store;

  @tracked clientList = [];
  @tracked isLoading = true;

  @reads('objects') clientList;

  targetModel = 'partner/partnerclient';
  sortProperties = 'createdOn:desc';
}
