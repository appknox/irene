/* eslint-disable prettier/prettier */
import Component from '@glimmer/component';
import {
  tracked
} from '@glimmer/tracking';
import {
  task
} from 'ember-concurrency';
import {
  inject as service
} from '@ember/service';
import {
  action
} from '@ember/object';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import FileCleanup from 'irene/validations/file-cleanup';

export default class FileCleanupComponent extends Component {

  @service store;
  @service ajax;
  @service('notifications') notify;
  @service intl;

  @tracked cleanupPref;

  @tracked isShowAllCleanup = false;

  @tracked isHideSettings = false;

  @tracked changeset = {};

  @action
  onChangePref(changeset, inType) {
    if (inType == 'checkbox') {
      changeset.set('isEnabled', !changeset.get('isEnabled'))
    }
    changeset.validate().then(() => {
      if (changeset.get('isValid')) {
        this.saveCleanupPref.perform();
      }
    })
  }

  @action
  onTriggerCleanup() {
    this.triggerFileCleanup.perform()
  }

  @action
  onViewAllCleanup() {
    this.isShowAllCleanup = !this.isShowAllCleanup;
  }

  @action
  onCloseModal() {
    this.isShowAllCleanup = false;
  }

  /**
   * @function saveCleanupPref
   * Method to update cleanup setting changes
   */
  @task(function* () {
    try {
      yield this.changeset.save();
      this.notify.success(this.intl.t('fileCleanup.msg.saveSuccess'))
    } catch (error) {
      this.notify.error(error[0].detail)
    }
  }).restartable() saveCleanupPref;

  /**
   * @function loadCleanupPref
   * Method to load cleanup preference for the active organization
   */
  @task(function* () {
    try {
      const cleanupPref = yield this.store.queryRecord('organization-cleanup-preference', {})
      this.changeset = new Changeset(cleanupPref, lookupValidator(FileCleanup), FileCleanup)
    } catch (error) {
      this.isHideSettings = error.errors[0].status == '404';
    }
  })
  loadCleanupPref;

  /**
   * @function triggerFileCleanup
   * Method to trigger a new file cleanup activity
   */
  @task(function* () {
    try {
      yield this.store.createRecord('organization-cleanup', {}).save();
      this.notify.success(this.intl.t('fileCleanup.msg.triggerSuccess'))
    } catch (error) {
      this.notify.error(error[0].detail)
    }
  }).restartable() triggerFileCleanup;

}
