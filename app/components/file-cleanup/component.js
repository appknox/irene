import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class FileCleanupComponent extends Component {

  @service store;
  @service ajax;
  @service ('notifications') notify;

  @tracked cleanupPref;

  @tracked isShowAllCelanup = false;

  @tracked is404Error = false;

  constructor() {
    super(...arguments);
    this.loadCleanupPref.perform();
  }

  @action
  onChangePref() {
    this.cleanupPref.isEnabled = !this.cleanupPref.isEnabled;
    this.saveCleanupPref.perform();
  }

  @action
  onTriggerCleanup() {
    this.triggerFileCleanup.perform();
  }

  @action
  onViewAllCleanup() {
    this.isShowAllCelanup = !this.isShowAllCelanup;
  }

  @action
  onCloseModal() {
    this.isShowAllCelanup = false;
  }

  @task(function* () {
    yield this.cleanupPref.save();
  })
  saveCleanupPref;

  @task(function* () {
    yield this.store.queryRecord('organization-cleanup-preference', {})
    .then((cleanupPref) => {
      this.cleanupPref = cleanupPref;
    })
    .catch((err) => {
      console.log('err', err);
      this.is404Error = err.errors[0].status === '404';
    })
  })
  loadCleanupPref;

  @task(function* () {
    yield this.store.createRecord('organization-cleanup', {}).save();
    this.notify.success('Success')
  })
  triggerFileCleanup;

}
