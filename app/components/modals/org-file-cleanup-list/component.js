import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class OrgFileCleanupListComponent extends Component {

  @service store;
  @service('notifications') notify;

  @tracked fileCleanupList = [];

  @tracked isLoading = false;

  constructor() {
    super(...arguments);
    this.loadCleanupList.perform();
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
