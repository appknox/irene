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

export default class OrgFileCleanupListComponent extends PaginationMixin(Component) {

  @service store;

  @tracked targetModel = 'organization-cleanup';

  constructor() {
    super(...arguments);
  }

  @reads('objects') fileCleanupList;

}
