import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { PaginationService } from '../../../mixins/paginate';

export default class OrgFileCleanupListComponent extends PaginationService(Component) {

  @service store;
  @service('notifications') notify;

  @tracked fileCleanupList = [];

  @tracked isLoading = false;

  @tracked targetModel = 'organization-cleanup';

  constructor() {
    super(...arguments);
    this.fileCleanupList = this.objects;
  }

  @task(function* () {
    this.isLoading = true;
    yield this.store.findAll('organization-cleanup')
    .then((cleanupList) => {
      this.fileCleanupList = cleanupList;
      this.isLoading = false;
    })
    .catch(() => {
      this.isLoading = false;
      this.notify.error('Problem with fetching celanup history')
    })
  })
  loadCleanupList;

}
